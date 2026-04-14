import type { Metadata } from 'next';
import Image from 'next/image';
import { Check } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import ListPropertyForm from '@/components/sections/ListPropertyForm';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.listProperty' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['sell property Dubai', 'list property Dubai', 'sell villa Dubai', 'sell apartment Dubai', 'Dubai property agent', 'property valuation Dubai', 'rent property Dubai'],
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/list-your-property/' : `https://blackoak-re.com/${locale}/list-your-property/`,
      languages: { en: 'https://blackoak-re.com/list-your-property/', fr: 'https://blackoak-re.com/fr/list-your-property/', ar: 'https://blackoak-re.com/ar/list-your-property/' },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? 'https://blackoak-re.com/list-your-property/' : `https://blackoak-re.com/${locale}/list-your-property/`,
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogTitle') }],
    },
  };
}

const benefitKeys = [
  'internationalReach',
  'expertValuation',
  'premiumExposure',
  'dedicatedAgent',
  'billionsExecuted',
  'zeroUpfrontFees',
] as const;

const stepKeys = ['step01', 'step02', 'step03', 'step04'] as const;

const statKeys = ['transactions', 'projects', 'neighbourhoods', 'support'] as const;

export default async function ListYourPropertyPage({ params }: Props) {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.listProperty' });

  const benefits = benefitKeys.map((key) => t(`benefits.${key}`));

  const steps = stepKeys.map((key) => ({
    number: t(`steps.${key}.number`),
    title: t(`steps.${key}.title`),
    description: t(`steps.${key}.description`),
  }));

  const stats = statKeys.map((key) => ({
    value: t(`stats.${key}.value`),
    label: t(`stats.${key}.label`),
  }));

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('breadcrumbs.home'), item: locale === 'en' ? 'https://blackoak-re.com' : `https://blackoak-re.com/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbs.listProperty'), item: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/list-your-property/` },
    ],
  };

  const listPropertyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Sell Your Property with BlackOak Real Estate',
    description: 'List your property with BlackOak Real Estate. Global buyer network, professional marketing & dedicated agent support to sell or rent your Dubai property.',
    url: locale === 'en' ? 'https://blackoak-re.com/list-your-property/' : `https://blackoak-re.com/${locale}/list-your-property/`,
    provider: {
      '@type': 'RealEstateAgent',
      name: 'BlackOak Real Estate',
      url: 'https://blackoak-re.com',
      telephone: '+971 4 398 9055',
    },
    areaServed: { '@type': 'City', name: 'Dubai' },
    inLanguage: locale,
    serviceType: 'Property Listing & Sales',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listPropertyJsonLd) }}
      />
      {/* Header */}
      <section className="pt-[156px] pb-8">
        <div className="container-narrow text-center">
          <SectionLabel>{t('headerLabel')}</SectionLabel>
          <div className="mt-5 text-center">
            <h1 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
              {t('heading')}
            </h1>
            <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-600">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Hero Banner */}
      <section className="relative w-full h-[450px] overflow-hidden">
        <Image
          src="/images/neighbourhoods/downtown-dubai.png"
          alt="Luxury Dubai property"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </section>

      {/* Why BlackOak + Form Section */}
      <section className="py-20">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Writeup + Bullet Points */}
            <AnimateOnScroll>
              <div>
                <SectionLabel className="justify-start">{t('whyBlackoakLabel')}</SectionLabel>
                <SectionHeading
                  title={t('whyBlackoakHeading')}
                  align="left"
                  className="mt-5"
                />
                <p className="mt-6 text-[16px] font-normal leading-[28px] tracking-[0.16px] text-[#5f6368]">
                  {t('whyBlackoakDescription')}
                </p>

                <div className="mt-8 space-y-4">
                  {benefits.map((benefit, i) => (
                    <AnimateOnScroll key={i} delay={i * 0.1}>
                      <div className="flex items-start gap-4 p-4 border border-gray-100 bg-white hover:shadow-sm transition-shadow">
                        <div className="flex-shrink-0 w-6 h-6 bg-black rounded-full flex items-center justify-center mt-0.5">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <p className="text-[15px] font-normal leading-[24px] text-[#333]">{benefit}</p>
                      </div>
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            {/* Right: Form */}
            <AnimateOnScroll delay={0.2}>
              <div className="lg:sticky lg:top-32">
                <h3 className="text-[24px] font-normal leading-[32px] mb-2">{t('formTitle')}</h3>
                <p className="text-[14px] leading-[22px] text-[#5f6368] mb-8">
                  {t('formSubtitle')}
                </p>
                <div className="bg-[#f9fafb] p-8 md:p-10">
                  <ListPropertyForm />
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* How It Works - Dark Section */}
      <section className="py-20 bg-black">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-16">
              <SectionLabel light>{t('processLabel')}</SectionLabel>
              <SectionHeading
                title={t('processHeading')}
                light
                className="mt-5"
              />
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <AnimateOnScroll key={step.number} delay={i * 0.15}>
                <div className="text-center">
                  <div className="text-[48px] font-light text-gold mb-4">{step.number}</div>
                  <h3 className="text-[20px] font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-[14px] font-normal leading-[22px] text-[#a0a0a0]">{step.description}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-16 bg-[#f0f3f8]">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <AnimateOnScroll key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-[36px] md:text-[42px] font-light leading-[1.2] text-black">{stat.value}</div>
                  <p className="mt-2 text-[14px] font-medium uppercase tracking-wider text-[#5f6368]">{stat.label}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}
