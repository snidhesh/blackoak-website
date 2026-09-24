// Proxy for The Briefing (static site on the blackoak-briefing Vercel project).
//
// The middleware has already turned away visitors without the access cookie; this
// handler checks it again (defence in depth), then fetches the same path from the
// origin with a request it builds itself: no visitor cookies, the protection-bypass
// secret when one is configured, and a private cache header on the way back. Doing
// the fetch here rather than as a middleware rewrite keeps every forwarded header
// under our control and keeps Next's internal rewrite headers off the wire.

import { NextRequest, NextResponse } from 'next/server';
import { BRIEFING_ORIGIN, INTEL_ACCESS_COOKIE } from '@/lib/constants';
import { verifyAccessToken } from '@/lib/access-cookie';
import { HUB_PATH, hasBriefingPrefix, isTraversal } from '@/lib/briefing-proxy';

export const dynamic = 'force-dynamic';

const FORWARDED_REQUEST_HEADERS = ['accept', 'accept-language', 'if-none-match', 'if-modified-since', 'range'];
const FORWARDED_RESPONSE_HEADERS = [
  'content-type',
  'content-language',
  'content-disposition',
  'content-range',
  'accept-ranges',
  'last-modified',
  'etag',
  'vary',
];
const RESPONSE_CACHE_CONTROL = 'private, max-age=300';

function notFound() {
  return new NextResponse(null, { status: 404 });
}

async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  if (isTraversal(pathname) || !hasBriefingPrefix(pathname)) return notFound();

  const allowed = await verifyAccessToken(request.cookies.get(INTEL_ACCESS_COOKIE)?.value);
  if (!allowed) {
    const hub = new URL(HUB_PATH, request.url);
    hub.searchParams.set('next', pathname + search);
    const redirect = NextResponse.redirect(hub);
    redirect.headers.set('Cache-Control', 'no-store');
    return redirect;
  }

  const target = new URL(pathname + search, BRIEFING_ORIGIN);
  if (target.origin !== BRIEFING_ORIGIN || !hasBriefingPrefix(target.pathname)) return notFound();

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const bypass = process.env.BRIEFING_BYPASS_SECRET;
  if (bypass) headers.set('x-vercel-protection-bypass', bypass);

  let upstream: Response;
  try {
    upstream = await fetch(target, { method: request.method, headers, redirect: 'manual', cache: 'no-store' });
  } catch (error) {
    console.error('[briefing] Origin fetch failed:', error);
    return new NextResponse(null, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  responseHeaders.set('Cache-Control', RESPONSE_CACHE_CONTROL);
  responseHeaders.set('X-Content-Type-Options', 'nosniff');

  // Origin redirects (e.g. its own trailing-slash rules) are re-based onto this
  // site so the visitor never lands on the origin host. Anything else is a 404.
  if (upstream.status >= 300 && upstream.status < 400) {
    const location = upstream.headers.get('location');
    if (!location) return notFound();
    const resolved = new URL(location, target);
    if (resolved.origin !== BRIEFING_ORIGIN || !hasBriefingPrefix(resolved.pathname)) return notFound();
    responseHeaders.set('Location', resolved.pathname + resolved.search);
    responseHeaders.set('Cache-Control', 'no-store');
    return new NextResponse(null, { status: upstream.status, headers: responseHeaders });
  }

  const body = request.method === 'HEAD' ? null : upstream.body;
  return new NextResponse(body, { status: upstream.status, headers: responseHeaders });
}

export async function GET(request: NextRequest) {
  return proxy(request);
}

export async function HEAD(request: NextRequest) {
  return proxy(request);
}

