// Redeems a personal link from the Monday email.
//
// The middleware answers GET /briefing/?s=<token> with a tiny page that posts the
// token here. Doing the redemption on a POST means the things that fetch links
// without a person behind them (mail security scanners, WhatsApp and iMessage link
// previews) never spend one of the link's opens. A valid token on a browser within
// the limit gets the same access cookie a verified subscriber gets, then a redirect
// to the clean /briefing/ address. Anything else goes to the subscribe gate.

import { NextRequest, NextResponse } from 'next/server';
import { BRIEFING_LINK_MAX_BROWSERS, INTEL_ACCESS_COOKIE } from '@/lib/constants';
import { accessCookieOptions, createAccessToken } from '@/lib/access-cookie';
import { BRIEFING_PATH, HUB_PATH, hasBriefingPrefix, isTraversal } from '@/lib/briefing-proxy';
import { verifyLinkToken } from '@/lib/briefing-link';
import { countLinkOpen, hashKey } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function maxBrowsers(): number {
  const configured = Number(process.env.BRIEFING_LINK_MAX_BROWSERS);
  return Number.isInteger(configured) && configured >= 1 && configured <= 50 ? configured : BRIEFING_LINK_MAX_BROWSERS;
}

// Only ever a path under /briefing on this site; anything else becomes the index.
function safeNext(value: FormDataEntryValue | null): string {
  const fallback = `${BRIEFING_PATH}/`;
  if (typeof value !== 'string' || value.length > 200) return fallback;
  if (!/^\/briefing\/[A-Za-z0-9._\-/]*$/.test(value) || isTraversal(value) || value.includes('..')) return fallback;
  return hasBriefingPrefix(value) ? value : fallback;
}

function redirect(request: NextRequest, path: string): NextResponse {
  const response = NextResponse.redirect(new URL(path, request.url), 303);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

function toGate(request: NextRequest, next: string): NextResponse {
  const hub = new URL(HUB_PATH, request.url);
  hub.searchParams.set('next', next);
  const response = NextResponse.redirect(hub, 303);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function POST(request: NextRequest) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirect(request, `${BRIEFING_PATH}/`);
  }
  const next = safeNext(form.get('next'));
  const token = form.get('s');

  // A browser that already holds the access cookie never gets here: the cookie is
  // scoped to /briefing, so the middleware sees it and skips the opening page.

  const verified = await verifyLinkToken(typeof token === 'string' ? token : null);
  if (!verified.ok) {
    if (verified.reason === 'misconfigured') console.error('[api/briefing/open] INTEL_ACCESS_SECRET is missing or too short');
    return toGate(request, next);
  }

  // The count is what stops a forwarded email from opening the Briefing for everyone
  // it reaches. If Upstash is down the subscriber still gets in: turning away a real
  // subscriber is the worse failure, and the token is signed and short-lived anyway.
  try {
    const opens = await countLinkOpen(hashKey(token as string), verified.exp);
    if (opens === null && process.env.NODE_ENV === 'production') {
      console.error('[api/briefing/open] Upstash is not configured; personal links are not being counted');
    }
    if (opens !== null && opens > maxBrowsers()) return toGate(request, next);
  } catch (error) {
    console.error('[api/briefing/open] Could not count the link open:', error);
  }

  const access = await createAccessToken();
  if (!access) return toGate(request, next);

  const response = redirect(request, next);
  response.cookies.set(INTEL_ACCESS_COOKIE, access.value, accessCookieOptions(access.exp));
  return response;
}

// The link is only ever redeemed by POST. A stray GET goes to the Briefing, where
// the middleware applies the normal gate.
export async function GET(request: NextRequest) {
  return redirect(request, `${BRIEFING_PATH}/`);
}
