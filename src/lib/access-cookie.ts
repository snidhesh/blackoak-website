// Signed access cookie that lets a verified subscriber through the /briefing proxy.
//
//   value = "<exp>.<base64url(HMAC-SHA256(secret, "intel-access:v1:" + exp))>"
//
// Verified in the Edge middleware, minted in a Node route handler, so this file
// uses only Web Crypto and imports nothing that pulls in node:crypto. The secret
// is INTEL_ACCESS_SECRET, separate from the newsletter code secret so the two can
// rotate independently. No secret means fail closed: nothing verifies.

import { INTEL_ACCESS_TTL_MS } from '@/lib/constants';

const MIN_SECRET_LENGTH = 32;
const MESSAGE_PREFIX = 'intel-access:v1:';
const SIGNATURE_BYTES = 32;
const EXP_PATTERN = /^\d{1,13}$/;

const encoder = new TextEncoder();
let cachedKey: { secret: string; key: CryptoKey } | null = null;

function getSecret(): string | null {
  const secret = process.env.INTEL_ACCESS_SECRET;
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : null;
}

export function hasAccessSecret(): boolean {
  return getSecret() !== null;
}

async function getKey(secret: string): Promise<CryptoKey> {
  if (cachedKey?.secret === secret) return cachedKey.key;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  cachedKey = { secret, key };
  return key;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Strict: only base64url characters, and exactly SIGNATURE_BYTES once decoded.
function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  try {
    const binary = atob(padded);
    if (binary.length !== SIGNATURE_BYTES) return null;
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

/** Returns null when INTEL_ACCESS_SECRET is not configured. */
export async function createAccessToken(now: number = Date.now()): Promise<{ value: string; exp: number } | null> {
  const secret = getSecret();
  if (!secret) return null;
  const exp = now + INTEL_ACCESS_TTL_MS;
  const signature = await crypto.subtle.sign('HMAC', await getKey(secret), encoder.encode(MESSAGE_PREFIX + exp));
  return { value: `${exp}.${toBase64Url(new Uint8Array(signature))}`, exp };
}

export async function verifyAccessToken(token: string | undefined, now: number = Date.now()): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) return false;

  const dot = token.indexOf('.');
  if (dot < 1) return false;
  const expText = token.slice(0, dot);
  const signature = fromBase64Url(token.slice(dot + 1));
  if (!EXP_PATTERN.test(expText) || !signature) return false;
  if (now > Number(expText)) return false;

  // The exact string from the cookie is what gets checked, never a re-serialised number.
  return crypto.subtle.verify('HMAC', await getKey(secret), signature, encoder.encode(MESSAGE_PREFIX + expText));
}

// Path-scoped to /briefing: the only reader is the proxy middleware, and this keeps
// the bearer token away from the other proxied apps (/bayn, /omoria, ...).
export function accessCookieOptions(exp: number, now: number = Date.now()) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/briefing',
    secure: process.env.NODE_ENV === 'production',
    maxAge: Math.max(0, Math.floor((exp - now) / 1000)),
  };
}
