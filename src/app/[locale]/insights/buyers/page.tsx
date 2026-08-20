import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import { getBuyers } from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

interface Props {
  params: { locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'metadata.buyers' });

  const localePath = locale === 'en' ? '/insights/buyers/' : `/${locale}/insights/buyers/`;
  const enUrl = 'https://blackoak-re.com/insights/buyers/';
  const frUrl = 'https://blackoak-re.com/fr/insights/buyers/';
  const arUrl = 'https://blackoak-re.com/ar/insights/buyers/';

  return {
    title: t('title'),
    description: t('description'),
    keywords: ['buy property Dubai foreigner', 'Dubai property buying guide', 'Golden Visa Dubai property', 'freehold areas Dubai', 'mortgage Dubai property', 'how to buy villa Dubai', 'Dubai property costs', 'international buyers Dubai real estate'],
    alternates: {
      canonical: `https://blackoak-re.com${localePath}`,
      languages: {
        en: enUrl,
        fr: frUrl,
        ar: arUrl,
      },
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      url: `https://blackoak-re.com${localePath}`,
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: t('title') }],
    },
  };
}

export default async function BuyersPage({ params }: Props) {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.insights.buyers' });
  const buyers = getBuyers(locale);
  const guides = buyers.guides;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('breadcrumbs.home'), item: locale === 'en' ? 'https://blackoak-re.com' : `https://blackoak-re.com/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbs.insights'), item: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/insights/buyers/` },
      { '@type': 'ListItem', position: 3, name: t('breadcrumbs.buyers'), item: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/insights/buyers/` },
    ],
  };

  const buyersJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Buy Property in Dubai',
    description: 'Complete guide to buying property in Dubai as a foreigner — covering Golden Visa, freehold areas, mortgages, and the buying process.',
    url: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/insights/buyers/`,
    inLanguage: locale,
    step: guides.map((guide, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: guide.title,
      url: `https://blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/insights/buyers/#${guide.id}`,
    })),
    author: {
      '@type': 'Organization',
      name: 'BlackOak Real Estate',
      url: 'https://blackoak-re.com',
    },
  };

  // Trim to a reasonable answer length at a sentence boundary (~800 chars).
  const trimAnswer = (text: string, max = 800) => {
    const t = text.trim();
    if (t.length <= max) return t;
    const cut = t.slice(0, max);
    const boundary = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('. '));
    return (boundary > 200 ? cut.slice(0, boundary + 1) : cut) + '…';
  };

  const faqEntries: Array<{ question: string; answer: string }> = [
    { question: buyers.whyInvest.title, answer: trimAnswer(buyers.whyInvest.content) },
    { question: buyers.visa.title, answer: trimAnswer(buyers.visa.intro) },
    { question: buyers.managingProperty.title, answer: trimAnswer(buyers.managingProperty.intro) },
    { question: buyers.mortgage.title, answer: trimAnswer(buyers.mortgage.paragraphs[0]) },
    { question: buyers.internationalBuyers.title, answer: trimAnswer(buyers.internationalBuyers.intro) },
    { question: buyers.costs.title, answer: trimAnswer(buyers.costs.intro) },
  ].filter((e) => e.answer);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: faqEntries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: { '@type': 'Answer', text: e.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buyersJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[70vh] overflow-hidden">
        <Image
          src={buyers.hero.image}
          alt={buyers.hero.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-[224px] bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[480px] bg-gradient-to-t from-black/90 to-transparent" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-[50px] font-light leading-tight">
            {buyers.hero.title.split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h1>
        </div>
      </section>

      {/* Property Buyers Guide Intro */}
      <section className="py-20">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>{buyers.intro.label}</SectionLabel>
            <SectionHeading
              title={buyers.intro.title}
              className="mt-5 max-w-[542px] mx-auto"
            />
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <p className="mt-8 text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto">
              {buyers.intro.description}
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Guide Navigation Cards */}
      <section className="pb-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((guide, i) => (
              <AnimateOnScroll key={guide.id} delay={i * 0.06}>
                <a
                  href={`#${guide.id}`}
                  className="group block border border-gray-200 px-8 py-6 text-center transition-all hover:border-black hover:bg-black hover:text-white"
                >
                  <span className="text-[18px] font-normal leading-[28px] text-gray-800 group-hover:text-white transition-colors">
                    {guide.title}
                  </span>
                </a>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Section 1: Why Invest Or Buy */}
      <section id="why-invest" className="scroll-mt-24">
        <div className="flex flex-col lg:flex-row">
          <div className="relative w-full lg:w-1/2 min-h-[400px] lg:min-h-[748px]">
            <Image
              src={buyers.whyInvest.image}
              alt={buyers.whyInvest.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="w-full lg:w-1/2 bg-black text-white flex items-center">
            <div className="px-8 lg:px-16 py-16 max-w-[627px]">
              <AnimateOnScroll>
                <h2 className="text-[32px] lg:text-[42px] font-light leading-[45px] lg:leading-[55px]">
                  {buyers.whyInvest.title}
                </h2>
                <p className="mt-10 text-[18px] font-normal leading-[30px] text-white">
                  {buyers.whyInvest.content}
                </p>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Risk sub-section */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>{buyers.minimalRisk.label}</SectionLabel>
              <SectionHeading
                title={buyers.minimalRisk.title}
                className="mt-5"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto space-y-10">
              <div className="space-y-6">
                <p>{buyers.minimalRisk.intro}</p>
                <p>{buyers.minimalRisk.sub}</p>
              </div>
              <ul className="list-disc ps-6 space-y-1">
                {buyers.minimalRisk.bullets.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p>{buyers.minimalRisk.closing}</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section 2: Obtaining a Visa */}
      <section id="obtaining-visa" className="py-20 bg-[#f0f3f8] scroll-mt-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>{buyers.visa.label}</SectionLabel>
              <SectionHeading
                title={buyers.visa.title}
                className="mt-5"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto">
              <p className="mb-10">{buyers.visa.intro}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {buyers.visa.types.map((type, i) => (
                  <div key={i} className="bg-white p-8 border border-gray-200">
                    <h3 className="text-[22px] font-normal leading-[32px] text-black mb-6">
                      {type.name}
                    </h3>
                    <ul className="list-disc ps-5 space-y-2 text-[#5f6368]">
                      {type.bullets.map((bullet, bi) => (
                        <li key={bi}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section 3: Managing Your Property */}
      <section id="managing-property" className="py-20 scroll-mt-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>{buyers.managingProperty.label}</SectionLabel>
              <SectionHeading
                title={buyers.managingProperty.title}
                className="mt-5 max-w-[700px] mx-auto"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto space-y-8">
              <p>{buyers.managingProperty.intro}</p>
              <ul className="list-disc ps-6 space-y-4">
                {buyers.managingProperty.options.map((option, i) => (
                  <li key={i}>{option}</li>
                ))}
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section 4: Mortgaging Your Property */}
      <section id="mortgaging-property" className="py-20 bg-[#f0f3f8] scroll-mt-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>{buyers.mortgage.label}</SectionLabel>
              <SectionHeading
                title={buyers.mortgage.title}
                className="mt-5"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto space-y-6">
              {buyers.mortgage.paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section 5: International Property Buyers */}
      <section id="international-buyers" className="py-20 scroll-mt-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>{buyers.internationalBuyers.label}</SectionLabel>
              <SectionHeading
                title={buyers.internationalBuyers.title}
                className="mt-5 max-w-[700px] mx-auto"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto space-y-8">
              <p>{buyers.internationalBuyers.intro}</p>
              <ol className="list-decimal ps-6 space-y-4">
                {buyers.internationalBuyers.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Section 6: Costs of Buying a Property */}
      <section id="costs-buying" className="py-20 bg-[#f0f3f8] scroll-mt-24">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel>{buyers.costs.label}</SectionLabel>
              <SectionHeading
                title={buyers.costs.title}
                className="mt-5 max-w-[700px] mx-auto"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1382px] mx-auto space-y-8">
              <p>{buyers.costs.intro}</p>
              <ul className="list-disc ps-6 space-y-3">
                {buyers.costs.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
