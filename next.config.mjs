import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isProd = process.env.NODE_ENV === 'production';

// Next.js dev uses React Refresh, which requires 'unsafe-eval'. Prod bundles do not.
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  !isProd && "'unsafe-eval'",
  'https://*.googletagmanager.com',
  'https://*.google-analytics.com',
].filter(Boolean).join(' ');

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://studio.blackoak-re.com https://static.shared.propertyfinder.ae https://*.public.blob.vercel-storage.com https://*.googletagmanager.com https://*.google-analytics.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://studio.blackoak-re.com",
  // www.google.com is for the Google Maps embed on project and international detail pages.
  "frame-src 'self' https://www.googletagmanager.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Production only. Browsers exempt localhost from this but not a LAN address, so
  // in dev it rewrites every asset to https://192.168.x.x:PORT, which does not exist,
  // and the site loads unstyled and unhydrated on a phone or another machine.
  isProd && 'upgrade-insecure-requests',
].filter(Boolean).join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      { source: '/bayn', destination: 'https://orabayn.vercel.app/bayn' },
      { source: '/bayn/:path*', destination: 'https://orabayn.vercel.app/bayn/:path*' },
      { source: '/yasresidences', destination: 'https://yasresidence.vercel.app/yasresidences' },
      { source: '/yasresidences/:path*', destination: 'https://yasresidence.vercel.app/yasresidences/:path*' },
      { source: '/omoria/api/:path*', destination: 'https://omoria-mauve.vercel.app/api/:path*' },
      { source: '/omoria', destination: 'https://omoria-mauve.vercel.app/omoria' },
      { source: '/omoria/:path*', destination: 'https://omoria-mauve.vercel.app/omoria/:path*' },
      // /briefing is proxied by src/middleware.ts behind the subscriber gate, not here.
      { source: '/baynopenhouse', destination: 'https://baynrsvp.vercel.app/baynopenhouse' },
      { source: '/baynopenhouse/:path*', destination: 'https://baynrsvp.vercel.app/baynopenhouse/:path*' },
      { source: '/yas_residences_rsvp', destination: 'https://mancityrsvp.vercel.app/yas_residences_rsvp' },
      { source: '/yas_residences_rsvp/:path*', destination: 'https://mancityrsvp.vercel.app/yas_residences_rsvp/:path*' },
      { source: '/aldar-openhouse', destination: 'https://aldar-lemon.vercel.app/aldar-openhouse/' },
      { source: '/aldar-openhouse/:path*', destination: 'https://aldar-lemon.vercel.app/aldar-openhouse/:path*' },

    ];
  },
  async redirects() {
    return [
      // Section roots that have no page of their own, so they do not 404.
      { source: '/insights', destination: '/insights/intelligence/', permanent: true },
      { source: '/:locale(fr|ar)/insights', destination: '/:locale/insights/intelligence/', permanent: true },
      { source: '/about', destination: '/about/why-blackoak/', permanent: true },
      { source: '/:locale(fr|ar)/about', destination: '/:locale/about/why-blackoak/', permanent: true },
      // English is served without a locale prefix. Without these, the locale
      // middleware answers /en/... with a temporary redirect.
      { source: '/en', destination: '/', permanent: true },
      { source: '/en/:path*', destination: '/:path*/', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Exclude /bayn/* so the proxied Bayn app isn't restricted by the main site's CSP
        //source: '/((?!bayn(?:/.*)?$|yasresidences(?:/.*)?$|omoria(?:/.*)?$).*)',
        source: '/((?!bayn(?:/.*)?$|yasresidences(?:/.*)?$|omoria(?:/.*)?$|briefing(?:/.*)?$|baynopenhouse(?:/.*)?$|yas_residences_rsvp(?:/.*)?$|aldar-openhouse(?:/.*)?$).*)',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Long-lived caching is production-only. In dev, /_next/static chunk names are
      // not content-hashed (e.g. app/[locale]/page.js), so "immutable" makes the browser
      // keep stale JS across edits — which surfaces as hydration errors.
      ...(isProd
        ? [
            {
              source: '/images/(.*)',
              headers: [
                { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
              ],
            },
            {
              source: '/_next/static/(.*)',
              headers: [
                { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
              ],
            },
          ]
        : []),
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'studio.blackoak-re.com',
      },
      {
        protocol: 'https',
        hostname: 'static.shared.propertyfinder.ae',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
