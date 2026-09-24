// Stateless email verification for the subscribe-to-unlock gates.
//
// There is no database, so nothing is stored. When a visitor asks for a code the
// server signs their details together with the code and returns that signed
// "challenge" to the browser. To verify, the browser sends the challenge back with
// the code the visitor typed, and the server recomputes the signature.
//
//   challenge = base64url(JSON payload) + "." + HMAC-SHA256(secret, payload + "|" + code)
//
// The code is never in the challenge, only folded into the signature, so holding a
// challenge does not reveal its code. Everything rests on NEWSLETTER_VERIFY_SECRET
// staying server-side: anyone who has it can find a code by trying all 1,000,000.

import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import type { SubscribeSource } from '@/lib/constants';

export const CODE_LENGTH = 6;
export const CODE_TTL_MS = 15 * 60 * 1000;
const MIN_SECRET_LENGTH = 32;

export interface ChallengePayload {
  firstName: string;
  lastName: string;
  email: string;
  locale?: 'en' | 'fr' | 'ar';
  /** Which page started the subscription; see SUBSCRIBE_SOURCES. */
  source?: SubscribeSource;
  utm?: Record<string, string>;
  /** Expiry, epoch milliseconds. */
  exp: number;
}

export type VerifyResult =
  | { ok: true; payload: ChallengePayload }
  | { ok: false; reason: 'invalid' | 'expired' | 'misconfigured' };

function getSecret(): string | null {
  const secret = process.env.NEWSLETTER_VERIFY_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    console.error(
      `[newsletter-token] NEWSLETTER_VERIFY_SECRET is missing or shorter than ${MIN_SECRET_LENGTH} characters`
    );
    return null;
  }
  return secret;
}

function sign(secret: string, encodedPayload: string, code: string): Buffer {
  return createHmac('sha256', secret).update(`${encodedPayload}|${code}`).digest();
}

export function generateCode(): string {
  return randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, '0');
}

/** Returns null when the signing secret is not configured. */
export function createChallenge(
  data: Omit<ChallengePayload, 'exp'>,
  code: string,
  now: number = Date.now()
): { challenge: string; exp: number } | null {
  const secret = getSecret();
  if (!secret) return null;

  const exp = now + CODE_TTL_MS;
  const encoded = Buffer.from(JSON.stringify({ ...data, exp }), 'utf8').toString('base64url');
  const signature = sign(secret, encoded, code).toString('base64url');
  return { challenge: `${encoded}.${signature}`, exp };
}

export function verifyChallenge(challenge: string, code: string, now: number = Date.now()): VerifyResult {
  const secret = getSecret();
  if (!secret) return { ok: false, reason: 'misconfigured' };

  const parts = challenge.split('.');
  if (parts.length !== 2) return { ok: false, reason: 'invalid' };
  const [encoded, signature] = parts;

  // Signature first: nothing in the payload is trusted until it checks out. A wrong
  // code and a tampered payload are indistinguishable here, by design.
  const expected = sign(secret, encoded, code);
  const provided = Buffer.from(signature, 'base64url');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return { ok: false, reason: 'invalid' };
  }

  let payload: ChallengePayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as ChallengePayload;
  } catch {
    return { ok: false, reason: 'invalid' };
  }

  if (typeof payload.exp !== 'number' || now > payload.exp) {
    return { ok: false, reason: 'expired' };
  }

  return { ok: true, payload };
}
