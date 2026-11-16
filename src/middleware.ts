import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import {
  BRIEFING_LINK_PARAM,
  BRIEFING_OPEN_PATH,
  BRIEFING_PREVIEW_PARAM,
  BRIEFING_PREVIEW_TTL_MS,
  INTEL_ACCESS_COOKIE,
} from '@/lib/constants';
import { accessCookieOptions, createAccessToken, matchesPreviewKey, verifyAccessToken } from '@/lib/access-cookie';
import { BRIEFING_PATH, HUB_PATH, hasBriefingPrefix, isTraversal } from '@/lib/briefing-proxy';
import { LINK_TOKEN_PATTERN } from '@/lib/briefing-link';

const intl = createMiddleware(routing);

// The Briefing lives on another Vercel project. Requests for it are let through
// here only when the visitor holds the access cookie minted by
// /api/newsletter/verify; the route handler at src/app/briefing then fetches the
// page from the origin. next.config has no rewrite for /briefing, so anything
// rejected below never reaches that origin.

// Loose reading of the path, used only to decide whether a request is aimed at the
// briefing. It is never used as the proxy target.
function probe(pathname: string): string {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // Malformed escape: keep the raw path.
  }
  return decoded.replace(/\/{2,}/g, '/').toLowerCase();
}

function noStore(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

// Opening page for a personal link from the Monday email (/briefing/?s=<token>).
// It posts the token to BRIEFING_OPEN_PATH straight away; the route there mints the
// access cookie and redirects to the clean address. A page that posts, rather than a
// redirect that redeems on GET, so that mail scanners and chat link previews cannot
// use the link up before the subscriber does. Both values are checked against strict
// patterns before they are written into the markup.
function openingPage(token: string, next: string): NextResponse {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="no-referrer">
<title>The Market Briefing</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0908;color:#e8e6e1;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
main{text-align:center;padding:24px}p{font-size:14px;letter-spacing:.04em;opacity:.75;margin:0 0 20px}
button{background:none;border:1px solid #ffb000;color:#ffb000;font:inherit;font-size:13px;letter-spacing:.14em;text-transform:uppercase;padding:13px 26px;cursor:pointer}</style>
</head><body><main>
<p>Opening The Market Briefing…</p>
<form id="open" method="post" action="${BRIEFING_OPEN_PATH}">
<input type="hidden" name="s" value="${token}">
<input type="hidden" name="next" value="${next}">
<noscript><button type="submit">Open the Briefing</button></noscript>
</form>
<script>document.getElementById('open').submit()</script>
</main></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Referrer-Policy': 'no-referrer',
    },
  });
}

const SAFE_NEXT_PATH = /^\/briefing\/[A-Za-z0-9._\-/]*$/;

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!hasBriefingPrefix(probe(pathname))) return intl(request);

  if (isTraversal(pathname)) return new NextResponse(null, { status: 404 });

  // Odd spelling of the prefix (/BRIEFING/, /%62riefing/, //briefing/): send to the
  // canonical index and stop. Exact-prefix paths go through untouched, so
  // mixed-case filenames and ordinary encoded characters keep working.
  if (!hasBriefingPrefix(pathname)) {
    return noStore(NextResponse.redirect(new URL(`${BRIEFING_PATH}/`, request.url), 308));
  }

  // Preview link: /briefing/...?key=<BRIEFING_PREVIEW_KEY>. A matching key mints the
  // access cookie and bounces to the same path with the key removed; any other key
  // is dropped and the request falls through to the normal gate below.
  if (request.nextUrl.searchParams.has(BRIEFING_PREVIEW_PARAM)) {
    const clean = new URL(request.url);
    clean.searchParams.delete(BRIEFING_PREVIEW_PARAM);
    if (matchesPreviewKey(request.nextUrl.searchParams.get(BRIEFING_PREVIEW_PARAM))) {
      const token = await createAccessToken(Date.now(), BRIEFING_PREVIEW_TTL_MS);
      if (token) {
        const response = noStore(NextResponse.redirect(clean, 303));
        response.cookies.set(INTEL_ACCESS_COOKIE, token.value, accessCookieOptions(token.exp));
        return response;
      }
    }
    return noStore(NextResponse.redirect(clean, 303));
  }

  const allowed = await verifyAccessToken(request.cookies.get(INTEL_ACCESS_COOKIE)?.value);

  // Personal link from the Monday email: /briefing/...?s=<token>. A browser that is
  // already let in just drops the token. Otherwise a well-formed token gets the
  // opening page, which hands it to the open route to be checked and counted; a
  // malformed one is dropped and the request meets the normal gate below. Either way
  // the token never stays in the address bar, so a copied address carries no access.
  if (request.nextUrl.searchParams.has(BRIEFING_LINK_PARAM)) {
    const token = request.nextUrl.searchParams.get(BRIEFING_LINK_PARAM) ?? '';
    const clean = new URL(request.url);
    clean.searchParams.delete(BRIEFING_LINK_PARAM);
    if (allowed || !LINK_TOKEN_PATTERN.test(token)) return noStore(NextResponse.redirect(clean, 303));
    if (request.method !== 'GET' && request.method !== 'HEAD') return new NextResponse(null, { status: 405 });
    return openingPage(token, SAFE_NEXT_PATH.test(pathname) ? pathname : `${BRIEFING_PATH}/`);
  }

  if (!allowed) {
    const hub = new URL(HUB_PATH, request.url);
    hub.searchParams.set('next', pathname + search);
    return noStore(NextResponse.redirect(hub));
  }

  // On to src/app/briefing/[[...path]]/route.ts, which checks the cookie again.
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match root
    '/',
    // The gated Briefing proxy, including archive/*.html and image files
    '/briefing/:path*',
    // Match all pathnames except api, _next, _vercel, reverse-proxied apps, and static files
    '/((?!api|_next|_vercel|bayn|yasresidences|omoria|briefing|baynopenhouse|yas_residences_rsvp|.*\\..*).*)',
    // Match locale-prefixed paths
    '/(fr|en|ar)/:path*',
  ],
};
