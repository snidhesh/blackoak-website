import type { MetadataRoute } from 'next';
import { getProjects, getNeighbourhoods, getCareers, getNews, getInternationalProperties } from '@/lib/content';
import { locales, defaultLocale } from '@/i18n/config';

const BASE_URL = 'https://blackoak-re.com';

// Fixed date for static content — update when static pages are meaningfully changed
const STATIC_LAST_MODIFIED = new Date('2026-05-01');

function localePath(path: string, locale: string): string {
  return locale === defaultLocale ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
}

function alternates(path: string): Record<string, string> {
  const langs: Record<string, string> = {
    'x-default': localePath(path, defaultLocale),
  };
  for (const l of locales) {
    langs[l] = localePath(path, l);
  }
  return langs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  const neighbourhoods = getNeighbourhoods();
  const careers = getCareers();
  const news = getNews();

  const staticPages = [
    '/',
    '/about/why-blackoak/',
    '/about/our-team/',
    '/projects/',
    '/neighbourhoods/',
    '/insights/investors/',
    '/insights/buyers/',
    '/insights/news/',
    '/insights/market-intelligence/',
    '/career/',
    '/contact/',
    '/list-your-property/',
    '/privacy-policy/',
    '/terms-of-service/',
    '/disclaimer/',
    '/international-properties/',
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Bayn landing page (reverse-proxied from orabayn.vercel.app, single-locale)
  entries.push({
    url: `${BASE_URL}/bayn/`,
    lastModified: STATIC_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: 0.9,
  });

  // Static pages — both locales
  for (const locale of locales) {
    for (const path of staticPages) {
      entries.push({
        url: localePath(path, locale),
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: path === '/' ? 'daily' : 'weekly',
        priority: path === '/' ? 1 : 0.8,
        alternates: { languages: alternates(path) },
      });
    }
  }

  // Projects — both locales
  for (const locale of locales) {
    for (const p of projects) {
      const path = `/projects/${p.slug}/`;
      entries.push({
        url: localePath(path, locale),
        lastModified: p.availableFrom ? new Date(p.availableFrom) : STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: { languages: alternates(path) },
      });
    }
  }

  // Neighbourhoods — both locales
  for (const locale of locales) {
    for (const n of neighbourhoods) {
      const path = `/neighbourhoods/${n.slug}/`;
      entries.push({
        url: localePath(path, locale),
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: { languages: alternates(path) },
      });
    }
  }

  // News — both locales
  for (const locale of locales) {
    for (const n of news) {
      const path = `/insights/news/${n.slug}/`;
      entries.push({
        url: localePath(path, locale),
        lastModified: new Date(n.publishedDate),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: { languages: alternates(path) },
      });
    }
  }

  // Careers — both locales
  for (const locale of locales) {
    for (const c of careers) {
      const path = `/career/${c.slug}/`;
      entries.push({
        url: localePath(path, locale),
        lastModified: new Date(c.postedDate),
        changeFrequency: 'weekly',
        priority: 0.6,
        alternates: { languages: alternates(path) },
      });
    }
  }

  // International properties — only `available` listings get detail URLs
  const intlProperties = getInternationalProperties().filter((p) => p.status === 'available');
  for (const locale of locales) {
    for (const p of intlProperties) {
      const path = `/international-properties/${p.slug}/`;
      entries.push({
        url: localePath(path, locale),
        lastModified: STATIC_LAST_MODIFIED,
        changeFrequency: 'weekly',
        priority: 0.85,
        alternates: { languages: alternates(path) },
      });
    }
  }

  return entries;
}
