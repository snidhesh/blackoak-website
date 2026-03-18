import type { MetadataRoute } from 'next';
import { getProjects, getNeighbourhoods, getCareers, getNews } from '@/lib/content';

const BASE_URL = 'https://blackoak-re.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects();
  const neighbourhoods = getNeighbourhoods();
  const careers = getCareers();
  const news = getNews();

  const staticPages = [
    '',
    '/about/why-blackoak',
    '/about/our-team',
    '/projects',
    '/insights/investors',
    '/insights/buyers',
    '/insights/news',
    '/career',
    '/contact',
    '/list-your-property',
    '/privacy-policy',
    '/terms-of-service',
    '/disclaimer',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${BASE_URL}/projects/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  const neighbourhoodEntries: MetadataRoute.Sitemap = neighbourhoods.map((n) => ({
    url: `${BASE_URL}/neighbourhoods/${n.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const newsEntries: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${BASE_URL}/insights/news/${n.slug}`,
    lastModified: new Date(n.publishedDate),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const careerEntries: MetadataRoute.Sitemap = careers.map((c) => ({
    url: `${BASE_URL}/career/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...projectEntries, ...neighbourhoodEntries, ...newsEntries, ...careerEntries];
}
