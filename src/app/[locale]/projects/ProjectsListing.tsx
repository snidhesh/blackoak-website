import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { getProjectListItems } from '@/lib/content';
import { PROJECTS_PER_PAGE } from '@/lib/constants';
import SectionLabel from '@/components/ui/SectionLabel';
import ProjectsClient from './ProjectsClient';

const BASE_URL = 'https://www.blackoak-re.com';

/** Site path of a listings page: /projects/ for page 1, /projects/page/N/ after that. */
export function projectsPagePath(page: number): string {
  return page <= 1 ? '/projects/' : `/projects/page/${page}/`;
}

function absoluteUrl(path: string, locale: string): string {
  return locale === 'en' ? `${BASE_URL}${path}` : `${BASE_URL}/${locale}${path}`;
}

export async function buildProjectsMetadata(locale: Locale, page: number): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata.projects' });
  const path = projectsPagePath(page);
  // Each page is its own canonical: pointing page 2+ at page 1 would tell
  // search engines to ignore the listings that only appear there.
  const title = page > 1 ? `${t('title')} – ${t('pageLabel', { page })}` : t('title');
  const ogTitle = page > 1 ? `${t('ogTitle')} – ${t('pageLabel', { page })}` : t('ogTitle');
  return {
    title,
    description: t('description'),
    keywords: ['luxury properties for sale Dubai', 'Dubai apartments for rent', 'villas for sale Dubai', 'penthouses Dubai', 'off-plan properties Dubai', 'Palm Jumeirah property', 'Emirates Hills villas', 'Dubai Hills Estate', 'branded residences Dubai'],
    alternates: {
      canonical: absoluteUrl(path, locale),
      languages: {
        'x-default': absoluteUrl(path, 'en'),
        en: absoluteUrl(path, 'en'),
        fr: absoluteUrl(path, 'fr'),
        ar: absoluteUrl(path, 'ar'),
      },
    },
    openGraph: {
      title: ogTitle,
      description: t('ogDescription'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: absoluteUrl(path, locale),
      images: [{ url: `${BASE_URL}/images/og-projects.jpg`, width: 1200, height: 630, alt: ogTitle }],
    },
  };
}

export async function ProjectsListing({ locale, page }: { locale: Locale; page: number }) {
  const t = await getTranslations({ locale, namespace: 'pages.projects' });
  const projects = await getProjectListItems();

  const totalPages = Math.max(1, Math.ceil(projects.length / PROJECTS_PER_PAGE));
  if (page > totalPages) notFound();

  const neighbourhoodSlugs = [...new Set(projects.map((p) => p.neighbourhood))];
  const propertyTypes = [...new Set(projects.map((p) => p.propertyType))];
  const offerings = [...new Set(projects.map((p) => p.offering).filter(Boolean))] as string[];

  const firstIndex = (page - 1) * PROJECTS_PER_PAGE;
  const pageUrl = absoluteUrl(projectsPagePath(page), locale);

  const projectsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Luxury Properties for Sale & Rent in Dubai',
    description: 'Explore luxury villas, apartments & penthouses for sale and rent across Dubai\'s most prestigious neighbourhoods.',
    url: pageUrl,
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: projects.length,
      itemListElement: projects.slice(firstIndex, firstIndex + PROJECTS_PER_PAGE).map((p, i) => ({
        '@type': 'ListItem',
        position: firstIndex + i + 1,
        url: absoluteUrl(`/projects/${p.slug}/`, locale),
        name: p.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsJsonLd) }}
      />
      {/* Black navbar backdrop */}
      <div className="bg-black h-16 lg:h-20" />

      {/* Hero - white bg */}
      <section className="bg-white pt-12 pb-16">
        <div className="container-wide text-center">
          <SectionLabel>{t('sectionLabel')}</SectionLabel>
          <h1 className="text-4xl md:text-[50px] font-light leading-tight text-black mt-5">
            {t('heading').split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-wide">
          {/* Keyed by page so moving between /projects/page/N/ pages resets the client state. */}
          <ProjectsClient
            key={page}
            projects={projects}
            neighbourhoodSlugs={neighbourhoodSlugs}
            propertyTypes={propertyTypes}
            offerings={offerings}
            initialPage={page}
          />
        </div>
      </section>
    </>
  );
}
