import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import IntelligenceHub from '@/components/sections/IntelligenceHub';
import { HUB_PRE_PAINT_UNLOCK_SCRIPT } from '@/lib/constants';

// Static page on purpose: the gate state lives in the browser (localStorage) and,
// for the Briefing, in a cookie only the middleware reads. Nothing here may call
// cookies() or take searchParams, or the route would render per request.

interface Props {
  params: { locale: string };
}

const PATH = '/insights/intelligence/';

function localeUrl(locale: Locale, path: string = PATH) {
  return `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}${path}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.intelligence' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: [
      'Dubai market intelligence',
      'UAE real estate briefing',
      'BlackOak Prime Capital Index',
      'Dubai property market report',
      'Dubai real estate weekly',
    ],
    alternates: {
      canonical: localeUrl(locale),
      languages: { en: localeUrl('en'), fr: localeUrl('fr'), ar: localeUrl('ar') },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      url: localeUrl(locale),
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

export default async function IntelligenceHubPage({ params }: Props) {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.insights.intelligence' });

  const canonical = localeUrl(locale);
  const homeUrl = localeUrl(locale, '/');

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('breadcrumbs.home'), item: homeUrl },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbs.insights'), item: canonical },
      { '@type': 'ListItem', position: 3, name: t('breadcrumbs.intelligence'), item: canonical },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* === HERO === */}
      <section className="bg-white pt-36 md:pt-44 pb-16 md:pb-20">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>{t('hero.eyebrow')}</SectionLabel>
            <h1 className="mt-6 text-[32px] md:text-[44px] lg:text-[52px] font-light leading-[1.15] tracking-tight text-black max-w-4xl mx-auto">
              {t('hero.title')}
            </h1>
            <div className="mt-8 mx-auto h-px w-12 bg-gold" />
            <p className="mt-8 text-base md:text-lg italic text-[#5f6368] max-w-2xl mx-auto leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Returning subscribers are unlocked before first paint; see constants.ts. */}
      <script dangerouslySetInnerHTML={{ __html: HUB_PRE_PAINT_UNLOCK_SCRIPT }} />

      <IntelligenceHub />
    </>
  );
}
