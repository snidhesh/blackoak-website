import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import {
  BRIEFING_PREVIEW_GRANT_COOKIE,
  BRIEFING_PREVIEW_GRANT_SCOPE,
  BRIEFING_PREVIEW_GRANT_TTL_MS,
  BRIEFING_PREVIEW_PARAM,
  BRIEFING_PREVIEW_TTL_MS,
  BRIEFING_PREVIEW_USED_COOKIE,
  INTEL_ACCESS_COOKIE,
} from '@/lib/constants';
import {
  accessCookieOptions,
  createAccessToken,
  matchesPreviewKey,
  previewGrantCookieOptions,
  verifyAccessToken,
} from '@/lib/access-cookie';
import {
  BRIEFING_INDEX_PATH,
  BRIEFING_PATH,
  HUB_PATH,
  hasBriefingPrefix,
  isPreviewPage,
  isPublicBriefingPath,
  isTraversal,
} from '@/lib/briefing-proxy';

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

  // One-time preview page (briefing/preview.html on the origin): public. A browser
  // that has not used its preview yet also gets a short-lived grant cookie, good for
  // one fetch of /briefing/index.html; the route handler burns it when it serves that
  // file. The page itself decides, from the used cookie or its own localStorage flag,
  // whether to show the edition or the subscribe wall.
  if (isPublicBriefingPath(pathname)) {
    const response = NextResponse.next();
    if (isPreviewPage(pathname) && !request.cookies.has(BRIEFING_PREVIEW_USED_COOKIE)) {
      const grant = await createAccessToken(Date.now(), BRIEFING_PREVIEW_GRANT_TTL_MS, BRIEFING_PREVIEW_GRANT_SCOPE);
      if (grant) response.cookies.set(BRIEFING_PREVIEW_GRANT_COOKIE, grant.value, previewGrantCookieOptions(grant.exp));
    }
    return response;
  }

  let allowed = await verifyAccessToken(request.cookies.get(INTEL_ACCESS_COOKIE)?.value);
  if (!allowed && pathname === BRIEFING_INDEX_PATH) {
    allowed = await verifyAccessToken(
      request.cookies.get(BRIEFING_PREVIEW_GRANT_COOKIE)?.value,
      Date.now(),
      BRIEFING_PREVIEW_GRANT_SCOPE
    );
  }
  if (!allowed) {
    const hub = new URL(HUB_PATH, request.url);
    hub.searchParams.set('next', pathname + search);
    return noStore(NextResponse.redirect(hub));
  }

  // On to src/app/briefing/[[...path]]/route.ts, which checks the cookies again.
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
