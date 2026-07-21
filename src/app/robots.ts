import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/thank-you/', '/fr/thank-you/', '/ar/thank-you/'],
      },
      // AI answer-engine bots: allow marketing content so BlackOak can be cited
      // in ChatGPT, Claude, Perplexity, and Google AI Overviews. Forms and
      // transactional endpoints stay blocked.
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'Claudebot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Google-Extended'],
        allow: '/',
        disallow: ['/api/', '/thank-you/', '/fr/thank-you/', '/ar/thank-you/', '/list-your-property/', '/contact/'],
      },
      // Bulk training / scraping crawlers: keep blocked. Bayn (proxied external
      // app) is explicitly allowed since it's hosted separately.
      {
        userAgent: ['Amazonbot', 'Bytespider', 'CCBot', 'meta-externalagent', 'Diffbot'],
        allow: '/bayn/',
        disallow: '/',
      },
    ],
    sitemap: 'https://blackoak-re.com/sitemap.xml',
  };
}
