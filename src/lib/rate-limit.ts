import { createHash } from 'node:crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Server-only (node:crypto): route handlers import this, the Edge middleware must not.

const PREFIX = 'blackoak-ratelimit';

let redis: Redis | null = null;
const limiters = new Map<string, Ratelimit>();

// Credentials come either from a hand-added UPSTASH_REDIS_REST_* pair or from the
// KV_REST_API_* pair that a Vercel Marketplace Upstash store injects by default.
function getCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

export function isRateLimitConfigured(): boolean {
  return getCredentials() !== null;
}

function getRedis(): Redis | null {
  if (redis) return redis;
  const creds = getCredentials();
  if (!creds) {
    console.warn('[rate-limit] Upstash Redis not configured, rate limiting disabled');
    return null;
  }
  redis = new Redis(creds);
  return redis;
}

// Sliding windows per purpose. The default covers the form endpoints; the
// newsletter ones cap how often one address can be sent a code and how many
// guesses one challenge gets, whatever IPs the requests come from.
type Window = `${number} ${'s' | 'm' | 'h'}`;
const LIMITS: Record<string, { tokens: number; window: Window }> = {
  default: { tokens: 5, window: '60 s' },
  'newsletter-email': { tokens: 3, window: '1 h' },
  'newsletter-verify-challenge': { tokens: 5, window: '15 m' },
};

function getRateLimiter(name: string): Ratelimit | null {
  const existing = limiters.get(name);
  if (existing) return existing;
  const client = getRedis();
  if (!client) return null;
  const { tokens, window } = LIMITS[name] ?? LIMITS.default;
  const limiter = new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
    prefix: PREFIX,
  });
  limiters.set(name, limiter);
  return limiter;
}

// Fails open when Upstash is not configured. Callers that must not run without a
// limit (the newsletter routes in production) check isRateLimitConfigured() first.
export async function checkRateLimit(identifier: string, endpoint: string): Promise<{ success: boolean; reset?: number }> {
  const limiter = getRateLimiter(endpoint);
  if (!limiter) return { success: true };
  const result = await limiter.limit(`${endpoint}:${identifier}`);
  return { success: result.success, reset: result.reset };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

export function hashKey(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

// Rate-limit key for an email address, not a rewrite of it: the code is still sent
// to the address as typed. Collapses the aliases that land in one inbox
// (+tags everywhere, dots on Gmail) so they share one bucket.
export function canonicalEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf('@');
  if (at < 0) return trimmed;
  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const plus = local.indexOf('+');
  if (plus >= 0) local = local.slice(0, plus);
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    local = local.replace(/\./g, '');
    return `${local}@gmail.com`;
  }
  return `${local}@${domain}`;
}

// Single-use codes. The first verifier of a challenge claims it; anyone replaying
// the same challenge and code afterwards is refused. Throws on Upstash errors so
// the caller can fail closed. Returns 'skipped' when Upstash is not configured.
export async function claimChallenge(
  challengeHash: string,
  expiresAt: number,
  now: number = Date.now()
): Promise<'claimed' | 'used' | 'skipped'> {
  const client = getRedis();
  if (!client) return 'skipped';
  // Upstash rejects EX <= 0, which a code at its expiry boundary would produce.
  const ex = Math.max(1, Math.ceil((expiresAt - now) / 1000));
  const result = await client.set(`${PREFIX}:used:${challengeHash}`, '1', { nx: true, ex });
  return result === 'OK' ? 'claimed' : 'used';
}

export async function releaseChallenge(challengeHash: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  await client.del(`${PREFIX}:used:${challengeHash}`);
}
