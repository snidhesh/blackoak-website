import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { INTEL_ACCESS_COOKIE } from '@/lib/constants';
import { verifyAccessToken } from '@/lib/access-cookie';
import { BRIEFING_PATH, HUB_PATH, hasBriefingPrefix, isTraversal } from '@/lib/briefing-proxy';

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

  const allowed = await verifyAccessToken(request.cookies.get(INTEL_ACCESS_COOKIE)?.value);
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
    '/((?!api|_next|_vercel|bayn|yasresidences|omoria|briefing|baynopenhouse|.*\\..*).*)',
    // Match locale-prefixed paths
    '/(fr|en|ar)/:path*',
  ],
};
