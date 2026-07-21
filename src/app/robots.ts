import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/thank-you/', '/fr/thank-you/', '/ar/thank-you/'],
      },
      {
        userAgent: ['Amazonbot', 'Bytespider', 'CCBot', 'GPTBot', 'Google-Extended', 'meta-externalagent', 'Claudebot', 'ChatGPT-User', 'PerplexityBot', 'Diffbot'],
        allow: '/bayn/',
        disallow: '/',
      },
    ],
    sitemap: 'https://blackoak-re.com/sitemap.xml',
  };
}
