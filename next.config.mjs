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
  "frame-src 'self' https://www.googletagmanager.com",
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
      { source: '/briefing', destination: 'https://blackoak-briefing.vercel.app/briefing' },
      { source: '/briefing/:path*', destination: 'https://blackoak-briefing.vercel.app/briefing/:path*' },
      { source: '/baynopenhouse', destination: 'https://baynrsvp.vercel.app/baynopenhouse' },
      { source: '/baynopenhouse/:path*', destination: 'https://baynrsvp.vercel.app/baynopenhouse/:path*' },

    ];
  },
  async headers() {
    return [
      {
        // Exclude /bayn/* so the proxied Bayn app isn't restricted by the main site's CSP
        //source: '/((?!bayn(?:/.*)?$|yasresidences(?:/.*)?$|omoria(?:/.*)?$).*)',
        source: '/((?!bayn(?:/.*)?$|yasresidences(?:/.*)?$|omoria(?:/.*)?$|briefing(?:/.*)?$|baynopenhouse(?:/.*)?$).*)',
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
