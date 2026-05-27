import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { getProjects } from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import ProjectsClient from './ProjectsClient';

export const revalidate = 300;
export const maxDuration = 60;

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.projects' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['luxury properties for sale Dubai', 'Dubai apartments for rent', 'villas for sale Dubai', 'penthouses Dubai', 'off-plan properties Dubai', 'Palm Jumeirah property', 'Emirates Hills villas', 'Dubai Hills Estate', 'branded residences Dubai'],
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/projects/' : `https://blackoak-re.com/${locale}/projects/`,
      languages: { en: 'https://blackoak-re.com/projects/', fr: 'https://blackoak-re.com/fr/projects/', ar: 'https://blackoak-re.com/ar/projects/' },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? 'https://blackoak-re.com/projects/' : `https://blackoak-re.com/${locale}/projects/`,
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogTitle') }],
    },
  };
}

export default async function ProjectsPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.projects' });
  const projects = await getProjects();

  const neighbourhoodSlugs = [...new Set(projects.map((p) => p.neighbourhood))];
  const propertyTypes = [...new Set(projects.map((p) => p.propertyType))];
  const offerings = [...new Set(projects.map((p) => p.offering).filter(Boolean))] as string[];

  const projectsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Luxury Properties for Sale & Rent in Dubai',
    description: 'Explore luxury villas, apartments & penthouses for sale and rent across Dubai\'s most prestigious neighbourhoods.',
    url: locale === 'en' ? 'https://blackoak-re.com/projects/' : `https://blackoak-re.com/${locale}/projects/`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: projects.length,
      itemListElement: projects.slice(0, 20).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: locale === 'en' ? `https://blackoak-re.com/projects/${p.slug}/` : `https://blackoak-re.com/${locale}/projects/${p.slug}/`,
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
          <ProjectsClient
            projects={projects}
            neighbourhoodSlugs={neighbourhoodSlugs}
            propertyTypes={propertyTypes}
            offerings={offerings}
          />
        </div>
      </section>
    </>
  );
}
