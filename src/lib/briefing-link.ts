// Personal links for the Monday "new edition" email.
//
//   access link   /briefing/?s=<exp36>.<subscriberId>.<signature>
//   unsubscribe   /api/briefing/unsubscribe/?u=<base64url(email)>.<signature>
//
// The access link is what lets a subscriber open the Briefing straight from the
// email, in any browser, without the subscribe form. Opening it mints the normal
// access cookie and lands on the clean /briefing/ address, so the address a reader
// copies from the browser carries no token and sends a non-subscriber to the gate.
// Each link opens on a limited number of browsers (see BRIEFING_LINK_MAX_BROWSERS)
// and expires with the edition, which bounds what a forwarded email can unlock.
//
// Web Crypto only: the middleware (Edge) checks the token's shape, the Node route
// handlers sign and verify. Signed with INTEL_ACCESS_SECRET under prefixes of their
// own, so a link signature can never be replayed as an access cookie or vice versa.

const MIN_SECRET_LENGTH = 32;
const LINK_PREFIX = 'briefing-link:v1:';
const UNSUBSCRIBE_PREFIX = 'briefing-unsubscribe:v1:';
const SIGNATURE_BYTES = 32;

/** Shape only: what the middleware will pass on to the open route. */
export const LINK_TOKEN_PATTERN = /^[0-9a-z]{6,10}\.[0-9a-f]{16}\.[A-Za-z0-9_-]{43}$/;

const encoder = new TextEncoder();
let cachedKey: { secret: string; key: CryptoKey } | null = null;

function getSecret(): string | null {
  const secret = process.env.INTEL_ACCESS_SECRET;
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : null;
}

async function getKey(secret: string): Promise<CryptoKey> {
  if (cachedKey?.secret === secret) return cachedKey.key;
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
  cachedKey = { secret, key };
  return key;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

async function sign(secret: string, message: string): Promise<string> {
  const signature = await crypto.subtle.sign('HMAC', await getKey(secret), encoder.encode(message));
  return toBase64Url(new Uint8Array(signature));
}

async function verify(secret: string, message: string, signature: string): Promise<boolean> {
  const bytes = fromBase64Url(signature);
  if (!bytes || bytes.length !== SIGNATURE_BYTES) return false;
  return crypto.subtle.verify('HMAC', await getKey(secret), bytes, encoder.encode(message));
}

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/** Stable, non-reversible id for a subscriber: the token never carries the address. */
async function subscriberId(email: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(normalizeEmail(email)));
  return Array.from(new Uint8Array(digest).slice(0, 8), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Returns null when INTEL_ACCESS_SECRET is not configured. `exp` is epoch milliseconds. */
export async function createLinkToken(email: string, exp: number): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const expText = Math.floor(exp / 1000).toString(36);
  const id = await subscriberId(email);
  return `${expText}.${id}.${await sign(secret, `${LINK_PREFIX}${expText}:${id}`)}`;
}

export type LinkTokenResult = { ok: true; exp: number } | { ok: false; reason: 'invalid' | 'expired' | 'misconfigured' };

export async function verifyLinkToken(token: string | null | undefined, now: number = Date.now()): Promise<LinkTokenResult> {
  const secret = getSecret();
  if (!secret) return { ok: false, reason: 'misconfigured' };
  if (!token || !LINK_TOKEN_PATTERN.test(token)) return { ok: false, reason: 'invalid' };
  const [expText, id, signature] = token.split('.');
  if (!(await verify(secret, `${LINK_PREFIX}${expText}:${id}`, signature))) return { ok: false, reason: 'invalid' };
  const exp = parseInt(expText, 36) * 1000;
  if (!Number.isFinite(exp) || now > exp) return { ok: false, reason: 'expired' };
  return { ok: true, exp };
}

/** Does not expire: an unsubscribe link in an old email must keep working. */
export async function createUnsubscribeToken(email: string): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const encoded = toBase64Url(encoder.encode(normalizeEmail(email)));
  return `${encoded}.${await sign(secret, UNSUBSCRIBE_PREFIX + encoded)}`;
}

/** Returns the subscriber's address when the token is genuine, otherwise null. */
export async function verifyUnsubscribeToken(token: string | null | undefined): Promise<string | null> {
  const secret = getSecret();
  if (!secret || !token || token.length > 600) return null;
  const dot = token.indexOf('.');
  if (dot < 1) return null;
  const encoded = token.slice(0, dot);
  if (!(await verify(secret, UNSUBSCRIBE_PREFIX + encoded, token.slice(dot + 1)))) return null;
  const bytes = fromBase64Url(encoded);
  if (!bytes) return null;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}
