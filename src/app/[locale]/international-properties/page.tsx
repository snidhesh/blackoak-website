import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import Image from 'next/image';
import {
  getInternationalRegions,
  getInternationalCountries,
  getInternationalPropertiesByCountry,
} from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';

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
  const regions = getInternationalRegions(locale);
  const countries = getInternationalCountries(locale);

  const countriesByRegion = regions.map((region) => ({
    region,
    countries: countries.filter((c) => c.region === region.slug),
  })).filter((group) => group.countries.length > 0);

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
          image: `https://blackoak-re.com${country.thumbnail}`,
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

      {/* Hero - white bg */}
      <section className="bg-white pt-12 pb-16">
        <div className="container-wide text-center">
          <SectionLabel>{t('sectionLabel')}</SectionLabel>
          <h1 className="text-4xl md:text-[50px] font-light leading-tight text-black mt-5">
            {t('heading')}
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {t('subheading')}
          </p>
        </div>
      </section>

      {/* Blurred content with coming soon overlay */}
      <div className="relative">
        {/* Coming soon overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="text-center px-4">
            <span className="inline-block border border-white/40 text-white text-[14px] font-medium tracking-[3px] uppercase px-8 py-4 rounded-sm mb-5">
              {t('comingSoon')}
            </span>
            <p className="text-white/80 text-[16px] leading-[28px] max-w-lg mx-auto">
              {t('comingSoonDescription')}
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="outline-light" size="lg">
                {t('notifyMe')}
              </Button>
            </div>
          </div>
        </div>

        {/* Blurred background content (non-interactive) */}
        <div className="pointer-events-none select-none blur-[3px]" aria-hidden="true">
          {countriesByRegion.map(({ region, countries: regionCountries }, groupIdx) => (
            <section
              key={region.slug}
              className={groupIdx % 2 === 0 ? 'py-16 bg-[#f8f9fa]' : 'py-16'}
            >
              <div className="container-wide">
                <div className="text-center mb-10">
                  <SectionLabel>{t('regionsLabel')}</SectionLabel>
                  <SectionHeading title={t('countriesInRegion', { region: region.name })} />
                  <p className="mt-3 text-gray-600 max-w-xl mx-auto text-sm">
                    {region.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {regionCountries.map((country) => {
                    const propertyCount = getInternationalPropertiesByCountry(country.countryCode, locale).length;
                    return (
                      <div
                        key={country.slug}
                        className="relative block aspect-[4/3] overflow-hidden rounded-md"
                      >
                        <Image
                          src={country.thumbnail}
                          alt={country.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white text-[16px] md:text-[18px] font-medium leading-tight">
                            {country.name}
                          </h3>
                          <p className="text-white/70 text-[12px] mt-1">
                            {t('propertiesCount', { count: propertyCount })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <section className="bg-black py-20">
        <div className="container-wide text-center">
          <SectionLabel light>{t('ctaLabel')}</SectionLabel>
          <h2 className="text-[28px] md:text-[32px] font-light text-white mt-5">
            {t('ctaHeading')}
          </h2>
          <p className="mt-4 text-gray-300 max-w-xl mx-auto">
            {t('ctaDescription')}
          </p>
          <div className="mt-8">
            <Button href="/contact" variant="outline-light" size="lg">
              {t('ctaButton')}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
