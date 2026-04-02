import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match root
    '/',
    // Match all pathnames except api, _next, _vercel, and static files
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Match locale-prefixed paths
    '/(fr|en|ar)/:path*',
  ],
};
