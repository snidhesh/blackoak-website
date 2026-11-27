import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { ProjectsListing, buildProjectsMetadata } from './ProjectsListing';
import { setRequestLocale } from 'next-intl/server';

export const revalidate = 300;
export const maxDuration = 60;

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return buildProjectsMetadata(params.locale as Locale, 1);
}

export default async function ProjectsPage({ params }: Props) {
  // Lets next-intl render this page statically instead of reading the locale
  // from the request on every visit.
  setRequestLocale(params.locale);
  return <ProjectsListing locale={params.locale as Locale} page={1} />;
}
