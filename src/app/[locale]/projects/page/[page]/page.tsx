import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { ProjectsListing, buildProjectsMetadata } from '../../ProjectsListing';
import { setRequestLocale } from 'next-intl/server';

// Pages 2 and up of the listings index. They exist as real URLs so every
// listing is reachable through plain links, not only through the sitemap.
export const revalidate = 300;
export const maxDuration = 60;

interface Props {
  params: { locale: string; page: string };
}

/** Parses the page segment. Only plain positive integers are valid pages. */
function parsePage(params: Props['params']): number {
  if (!/^[1-9]\d{0,3}$/.test(params.page)) notFound();
  const page = Number(params.page);
  // Page 1 lives at /projects/.
  if (page === 1) permanentRedirect(params.locale === 'en' ? '/projects/' : `/${params.locale}/projects/`);
  return page;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildProjectsMetadata(params.locale as Locale, parsePage(params));
}

export default async function ProjectsPaginatedPage({ params }: Props) {
  // Lets next-intl render this page statically instead of reading the locale
  // from the request on every visit.
  setRequestLocale(params.locale);
  return <ProjectsListing locale={params.locale as Locale} page={parsePage(params)} />;
}
