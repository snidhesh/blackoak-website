import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import {
  getInternationalCountries,
  getInternationalProperties,
  getInternationalRegions,
} from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import InternationalPropertyGrid from '@/components/sections/InternationalPropertyGrid';
import FeaturedInternationalShowcase from '@/components/sections/FeaturedInternationalShowcase';
import ComingSoonBlock from '@/components/sections/ComingSoonBlock';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.internationalProperties' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/international-properties/' : `https://blackoak-re.com/${locale}/international-properties/`,
      languages: {
        en: 'https://blackoak-re.com/international-properties/',
        fr: 'https://blackoak-re.com/fr/international-properties/',
        ar: 'https://blackoak-re.com/ar/international-properties/',
      },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? 'https://blackoak-re.com/international-properties/' : `https://blackoak-re.com/${locale}/international-properties/`,
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogTitle') }],
    },
  };
}

export default async function InternationalPropertiesPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.internationalProperties' });
  const countries = getInternationalCountries(locale);
  const regions = getInternationalRegions(locale);
  const availableProperties = getInternationalProperties(locale).filter((p) => p.status === 'available');

  // Curated 3 postcards: US, UK, Europe. Europe uses Italy's thumbnail as a stand-in image; its label
  // comes from the translated region name so fr/ar render correctly.
  const usCountry = countries.find((c) => c.countryCode === 'US');
  const ukCountry = countries.find((c) => c.countryCode === 'GB');
  const europeRegion = regions.find((r) => r.slug === 'europe');
  const italyCountry = countries.find((c) => c.countryCode === 'IT');
  const comingSoonEntries = [
    usCountry && { name: usCountry.name, image: usCountry.thumbnail },
    ukCountry && { name: ukCountry.name, image: ukCountry.thumbnail },
    europeRegion && italyCountry && { name: europeRegion.name, image: italyCountry.thumbnail },
  ].filter(Boolean) as { name: string; image: string }[];

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t('heading'),
    description: t('subheading'),
    url: locale === 'en' ? 'https://blackoak-re.com/international-properties/' : `https://blackoak-re.com/${locale}/international-properties/`,
    inLanguage: locale,
    publisher: {
      '@type': 'Organization',
      name: 'BlackOak Real Estate',
      logo: { '@type': 'ImageObject', url: 'https://blackoak-re.com/images/logo-white.png' },
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: countries.length,
      itemListElement: countries.map((country, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Place',
          name: country.name,
          image: country.thumbnail.startsWith('http') ? country.thumbnail : `https://blackoak-re.com${country.thumbnail}`,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {/* Black navbar backdrop */}
      <div className="bg-black h-16 lg:h-20" />

      {/* Hero - cream bg for premium editorial feel */}
      <section className="bg-[#f5f1ea] pt-14 pb-12 md:pt-20 md:pb-16">
        <div className="container-wide text-center">
          <SectionLabel>{t('sectionLabel')}</SectionLabel>
          <h1 className="text-4xl md:text-[50px] font-light leading-tight text-black mt-5 max-w-3xl mx-auto">
            {t('heading')}
          </h1>
          <p className="mt-5 text-base md:text-lg text-black/65 max-w-2xl mx-auto leading-relaxed">
            {t('subheading')}
          </p>
        </div>
      </section>

      {/* Featured listing — premium showcase on cream surround */}
      {availableProperties.length === 1 ? (
        <section className="pb-20 md:pb-28 bg-[#f5f1ea]">
          <div className="container-wide">
            <div className="shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]">
              <FeaturedInternationalShowcase
                property={availableProperties[0]}
                locale={locale}
                variant="dark"
              />
            </div>
          </div>
        </section>
      ) : availableProperties.length > 1 ? (
        <section className="pb-16 bg-[#f5f1ea]">
          <div className="container-wide">
            <InternationalPropertyGrid properties={availableProperties} columns={3} />
          </div>
        </section>
      ) : null}

      {/* Coming Soon — 3 curated postcards (US · UK · Europe) blurred together under one shared title */}
      {comingSoonEntries.length > 0 && (
        <ComingSoonBlock entries={comingSoonEntries} locale={locale} />
      )}
    </>
  );
}
