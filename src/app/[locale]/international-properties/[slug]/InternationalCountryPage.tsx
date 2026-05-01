import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import type { InternationalCountry } from '@/types/international-property';
import { getInternationalPropertiesByCountry } from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import Button from '@/components/ui/Button';
import InternationalPropertyGrid from '@/components/sections/InternationalPropertyGrid';

interface Props {
  country: InternationalCountry;
  locale: Locale;
}

export default async function InternationalCountryPage({ country, locale }: Props) {
  const t = await getTranslations({ locale, namespace: 'pages.internationalCountry' });
  const properties = getInternationalPropertiesByCountry(country.countryCode, locale);

  const localePath = (path: string, loc: string) =>
    loc === 'en' ? `https://blackoak-re.com${path}` : `https://blackoak-re.com/${loc}${path}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('breadcrumbs.home'), item: localePath('/', locale) },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbs.internationalProperties'), item: localePath('/international-properties/', locale) },
      { '@type': 'ListItem', position: 3, name: country.name, item: localePath(`/international-properties/${country.slug}/`, locale) },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <section className="relative h-[520px] md:h-[700px] lg:h-[800px] flex items-center justify-center overflow-hidden">
        <Image
          src={country.heroImage}
          alt={country.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-[224px] bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[480px] bg-gradient-to-t from-black/90 to-transparent" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-[36px] md:text-[50px] font-light leading-tight">{country.name}</h1>
        </div>
      </section>

      {/* About */}
      <section className="py-16">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-8">
              <SectionLabel>{t('aboutLabel')}</SectionLabel>
              <SectionHeading title={country.name} />
            </div>
            <p className="text-[#5f6368] text-base leading-[28px] tracking-[0.16px] max-w-[1216px] mx-auto whitespace-pre-line">
              {country.description}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Why Invest */}
      {country.whyInvest.points.length > 0 && (
        <section className="py-20 bg-black">
          <div className="container-wide">
            <div className="flex flex-col lg:flex-row items-start gap-16">
              <div className="flex-1">
                <AnimateOnScroll>
                  <SectionLabel light>{t('whyInvestLabel')}</SectionLabel>
                  <h2 className="text-[32px] font-light text-white leading-[1.3] mt-5 mb-10">
                    {country.whyInvest.title}
                  </h2>
                </AnimateOnScroll>
                <div className="space-y-6">
                  {country.whyInvest.points.map((item, i) => (
                    <AnimateOnScroll key={item.title} delay={i * 0.1}>
                      <div>
                        <h3 className="text-white text-base font-semibold mb-1">
                          {item.title}
                        </h3>
                        <p className="text-[#e2e2e2] text-sm leading-[22px]">
                          {item.description}
                        </p>
                      </div>
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
              <div className="flex-1 relative aspect-[605/631] w-full overflow-hidden rounded">
                <Image
                  src={country.heroImage}
                  alt={country.whyInvest.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Properties */}
      {properties.length > 0 && (
        <section className="py-16">
          <div className="container-wide">
            <AnimateOnScroll>
              <div className="text-center mb-10">
                <SectionLabel>{t('propertiesLabel')}</SectionLabel>
                <SectionHeading title={t('propertiesHeading', { country: country.name })} />
              </div>
            </AnimateOnScroll>
            <InternationalPropertyGrid properties={properties} />
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-black py-20">
        <div className="container-wide text-center">
          <SectionLabel light>{t('ctaLabel')}</SectionLabel>
          <h2 className="text-[28px] md:text-[32px] font-light text-white mt-5">
            {t('ctaHeading', { country: country.name })}
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
