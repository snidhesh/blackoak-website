import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;

function getRateLimiter(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[rate-limit] Upstash Redis not configured, rate limiting disabled');
    return null;
  }

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    analytics: true,
    prefix: 'blackoak-ratelimit',
  });

  return ratelimit;
}

export async function checkRateLimit(identifier: string, endpoint: string): Promise<{ success: boolean; reset?: number }> {
  const limiter = getRateLimiter();

  if (!limiter) {
    return { success: true };
  }

  const key = `${endpoint}:${identifier}`;
  const result = await limiter.limit(key);

  return {
    success: result.success,
    reset: result.reset,
  };
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
