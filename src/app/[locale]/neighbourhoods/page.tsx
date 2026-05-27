import type { Metadata } from 'next';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowUpRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { getNeighbourhoods } from '@/lib/content';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.neighbourhoods' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/neighbourhoods/' : `https://blackoak-re.com/${locale}/neighbourhoods/`,
      languages: {
        en: 'https://blackoak-re.com/neighbourhoods/',
        fr: 'https://blackoak-re.com/fr/neighbourhoods/',
        ar: 'https://blackoak-re.com/ar/neighbourhoods/',
      },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? 'https://blackoak-re.com/neighbourhoods/' : `https://blackoak-re.com/${locale}/neighbourhoods/`,
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogTitle') }],
    },
  };
}

export const revalidate = 300;

export default async function NeighbourhoodsPage({ params }: Props) {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.neighbourhoodsLanding' });
  const neighbourhoods = getNeighbourhoods(locale);

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('heading'),
    description: t('subtitle'),
    url: locale === 'en' ? 'https://blackoak-re.com/neighbourhoods/' : `https://blackoak-re.com/${locale}/neighbourhoods/`,
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: 'BlackOak Real Estate',
      logo: { '@type': 'ImageObject', url: 'https://blackoak-re.com/images/logo-white.png' },
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: neighbourhoods.length,
      itemListElement: neighbourhoods.map((n, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Place',
          name: n.name,
          description: n.tagline,
          image: `https://blackoak-re.com${n.heroImage}`,
          url: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/neighbourhoods/${n.slug}/`,
        },
      })),
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'fr' ? 'Accueil' : locale === 'ar' ? 'الرئيسية' : 'Home',
        item: locale === 'en' ? 'https://blackoak-re.com' : `https://blackoak-re.com/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('sectionLabel'),
        item: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/neighbourhoods/`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Black navbar backdrop */}
      <div className="bg-black h-16 lg:h-20" />

      {/* Hero - white bg */}
      <section className="bg-white pt-12 pb-16">
        <div className="container-wide text-center">
          <SectionLabel>{t('sectionLabel')}</SectionLabel>
          <h1 className="text-4xl md:text-[50px] font-light leading-tight text-black mt-5">
            {t('heading')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Neighbourhood Grid - dark background */}
      <section className="py-20 bg-black">
        <div className="container-wide">
          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-3">
            {neighbourhoods.map((n, i) => (
              <AnimateOnScroll key={n.slug} delay={i * 0.06}>
                <Link
                  href={`/neighbourhoods/${n.slug}`}
                  className="group relative block overflow-hidden"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={n.heroImage}
                      alt={n.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-3 end-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h2 className="text-white text-[18px] font-medium leading-tight">
                        {n.name}
                      </h2>
                      <p className="text-white/60 text-[13px] font-light mt-1 line-clamp-2">
                        {n.tagline}
                      </p>
                    </div>
                  </div>
                </Link>
              </AnimateOnScroll>
            ))}
          </div>

          {/* Mobile grid */}
          <div className="md:hidden grid grid-cols-2 gap-3">
            {neighbourhoods.map((n) => (
              <Link
                key={n.slug}
                href={`/neighbourhoods/${n.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden"
              >
                <Image
                  src={n.heroImage}
                  alt={n.name}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h2 className="text-white text-[14px] font-medium leading-tight">
                    {n.name}
                  </h2>
                  <p className="text-white/60 text-[11px] font-light mt-0.5 line-clamp-1">
                    {n.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
