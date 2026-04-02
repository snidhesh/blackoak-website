import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import Accordion from '@/components/ui/Accordion';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.investors' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['Dubai property investment', 'real estate investment Dubai', 'Dubai ROI property', 'high yield Dubai property', 'syndicated real estate deals Dubai', 'HNWI investment Dubai', 'Golden Visa property investment', 'Dubai real estate returns'],
    alternates: {
      canonical: locale === 'en' ? 'https://blackoak-re.com/insights/investors/' : `https://blackoak-re.com/${locale}/insights/investors/`,
      languages: { en: 'https://blackoak-re.com/insights/investors/', fr: 'https://blackoak-re.com/fr/insights/investors/', ar: 'https://blackoak-re.com/ar/insights/investors/' },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      url: 'https://blackoak-re.com/insights/investors/',
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('ogTitle') }],
    },
  };
}

const sectionKeys = ['syndicated', 'tailored', 'institutional', 'collaborative'] as const;

const sectionImages: Record<string, string> = {
  syndicated: '/images/investors/syndicated.png',
  tailored: '/images/investors/tailored.jpg',
  institutional: '/images/investors/institutional.png',
  collaborative: '/images/investors/tailored.jpg',
};

const sectionImagePositions: Record<string, 'left' | 'right'> = {
  syndicated: 'left',
  tailored: 'right',
  institutional: 'left',
  collaborative: 'right',
};

const faqKeys = ['q1', 'q2', 'q3', 'q4'] as const;

export default async function InvestorsPage({ params }: Props) {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.insights.investors' });

  const sections = sectionKeys.map((key) => ({
    key,
    title: t(`sections.${key}.title`),
    description: t(`sections.${key}.description`),
    image: sectionImages[key],
    imagePosition: sectionImagePositions[key],
  }));

  const faq = faqKeys.map((key) => ({
    question: t(`faq.${key}.question`),
    answer: t(`faq.${key}.answer`),
  }));

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[70vh] overflow-hidden">
        <Image
          src="/images/investors/hero.jpg"
          alt={t('heroAlt')}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-[224px] bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[480px] bg-gradient-to-t from-black/90 to-transparent" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-[50px] font-light leading-tight">
            {t('heroHeading').split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
        </div>
      </section>

      {/* Why BlackOak? */}
      <section className="py-20">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>{t('whyBlackoakLabel')}</SectionLabel>
            <SectionHeading
              title={t('whyBlackoakHeading')}
              className="mt-5"
            />
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="mt-8 text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1216px] mx-auto space-y-6">
              <p>{t('whyBlackoakP1')}</p>
              <p>{t('whyBlackoakP2')}</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Invest with Blackoak */}
      <section className="py-16">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>{t('investLabel')}</SectionLabel>
            <SectionHeading
              title={t('investHeading')}
              className="mt-5"
            />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Alternating content sections */}
      {sections.map((section) => (
        <section key={section.key} className="py-16">
          <div className="container-wide">
            <div className={`flex flex-col ${section.imagePosition === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
              <AnimateOnScroll>
                <div className="relative w-full lg:w-[600px] aspect-[4/3] overflow-hidden">
                  <Image src={section.image} alt={section.title} fill className="object-cover" />
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={0.2}>
                <div className="lg:w-[571px]">
                  <h3 className="text-[26px] font-normal leading-[32px] text-black">
                    {section.title}
                  </h3>
                  <div className="mt-8 text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] space-y-6">
                    {section.description.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      ))}

      {/* FAQ */}
      <section className="py-20 bg-[#f0f3f8]">
        <div className="container-narrow">
          <AnimateOnScroll>
            <SectionLabel>{t('faqLabel')}</SectionLabel>
            <SectionHeading
              title={t('faqHeading')}
              className="mt-5 max-w-[546px] mx-auto mb-12"
            />
          </AnimateOnScroll>
          <div className="max-w-[1272px] mx-auto">
            <Accordion items={faq} />
          </div>
        </div>
      </section>
    </>
  );
}
