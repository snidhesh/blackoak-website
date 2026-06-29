import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { getMarketIntelligence } from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import Button from '@/components/ui/Button';
import MarketIntelligenceModule from '@/components/sections/MarketIntelligenceModule';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.marketIntelligence' });

  const localePath =
    locale === 'en' ? '/insights/market-intelligence/' : `/${locale}/insights/market-intelligence/`;
  const enUrl = 'https://blackoak-re.com/insights/market-intelligence/';
  const frUrl = 'https://blackoak-re.com/fr/insights/market-intelligence/';
  const arUrl = 'https://blackoak-re.com/ar/insights/market-intelligence/';

  return {
    title: t('title'),
    description: t('description'),
    keywords: [
      'Dubai property prices',
      'Dubai real estate market 2026',
      'Dubai residential prices per sq ft',
      'Dubai property cycles',
      'Dubai market forecast 2030',
      'Dubai real estate investment calculator',
      'Dubai property historical prices',
    ],
    alternates: {
      canonical: `https://blackoak-re.com${localePath}`,
      languages: { en: enUrl, fr: frUrl, ar: arUrl },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'article',
      url: `https://blackoak-re.com${localePath}`,
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      images: [
        {
          url: 'https://blackoak-re.com/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
  };
}

export default async function MarketIntelligencePage({ params }: Props) {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.marketIntelligence' });
  const content = getMarketIntelligence(locale);

  const canonical = `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/insights/market-intelligence/`;
  const homeUrl = locale === 'en' ? 'https://blackoak-re.com' : `https://blackoak-re.com/${locale}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: homeUrl },
      { '@type': 'ListItem', position: 2, name: 'Insights & Intelligence', item: canonical },
      { '@type': 'ListItem', position: 3, name: 'Market Intelligence', item: canonical },
    ],
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.hero.title,
    description: t('description'),
    url: canonical,
    inLanguage: locale,
    dateModified: '2026-06-28',
    author: {
      '@type': 'Organization',
      name: 'BlackOak Real Estate',
      url: 'https://blackoak-re.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BlackOak Real Estate',
      logo: {
        '@type': 'ImageObject',
        url: 'https://blackoak-re.com/images/logo-white.png',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* === HERO === */}
      <section className="bg-white pt-36 md:pt-44 pb-16 md:pb-24">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>{content.hero.eyebrow}</SectionLabel>
            <h1 className="mt-6 text-[32px] md:text-[44px] lg:text-[52px] font-light leading-[1.15] tracking-tight text-black max-w-4xl mx-auto">
              {content.hero.title}
            </h1>
            <div className="mt-8 mx-auto h-px w-12 bg-gold" />
            <p className="mt-8 text-base md:text-lg italic text-[#5f6368] max-w-2xl mx-auto leading-relaxed">
              {content.hero.subtitle}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* === INTERACTIVE MODULE (chart on dark, panels on light blue) === */}
      <MarketIntelligenceModule content={content} />

      {/* === CTA === */}
      <section className="bg-black text-white py-20 md:py-28">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel className="text-gold [&::before]:bg-white/20 [&::after]:bg-white/20">
              {content.cta.eyebrow}
            </SectionLabel>
            <h2 className="mt-6 text-[28px] md:text-[36px] lg:text-[42px] font-light leading-tight tracking-tight text-white max-w-3xl mx-auto">
              {content.cta.title}
            </h2>
            <p className="mt-6 text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto">
              {content.cta.body}
            </p>
            <div className="mt-10">
              <Button href="/contact" variant="outline-light" size="md">
                {content.cta.cta}
              </Button>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* === METHODOLOGY === */}
      <section className="bg-white py-12 md:py-16 border-t border-gray-200">
        <div className="container-narrow">
          <p className="text-[11px] leading-[1.8] text-gray-500 tracking-[0.02em]">
            {content.methodology}
          </p>
        </div>
      </section>
    </>
  );
}
