import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import CountUp from '@/components/ui/CountUp';

export const metadata: Metadata = {
  title: 'Why BlackOak - About Our Luxury Real Estate Firm',
  description:
    'BlackOak Real Estate combines private advisory, concierge services & strategic investments across Dubai. Trusted by HNW clients for luxury property expertise.',
  alternates: { canonical: 'https://blackoak-re.com/about/why-blackoak/' },
  openGraph: {
    title: 'Why BlackOak - About Our Luxury Real Estate Firm',
    description:
      'BlackOak Real Estate combines private advisory, concierge services & strategic investments across Dubai. Trusted by HNW clients for luxury property expertise.',
    type: 'website',
    url: 'https://blackoak-re.com/about/why-blackoak/',
    images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: 'About BlackOak Real Estate' }],
  },
};

const featureCardImages = [
  '/images/about/high-quality-projects.png',
  '/images/about/beyond-advisory.png',
  '/images/about/expert-knowledge.png',
];

export default async function WhyBlackOakPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.about.whyBlackoak' });

  const featureCards = [
    {
      title: t('featureCards.highQuality.title'),
      description: t('featureCards.highQuality.description'),
      image: featureCardImages[0],
    },
    {
      title: t('featureCards.beyondAdvisory.title'),
      description: t('featureCards.beyondAdvisory.description'),
      image: featureCardImages[1],
    },
    {
      title: t('featureCards.expertKnowledge.title'),
      description: t('featureCards.expertKnowledge.description'),
      image: featureCardImages[2],
    },
  ];

  const stats = [
    { end: Number(t('stats.years.end')), suffix: t('stats.years.suffix'), label: t('stats.years.label'), sublabel: t('stats.years.sublabel') },
    { end: Number(t('stats.success.end')), suffix: t('stats.success.suffix'), label: t('stats.success.label'), sublabel: t('stats.success.sublabel') },
    { end: Number(t('stats.awards.end')), suffix: t('stats.awards.suffix'), label: t('stats.awards.label'), sublabel: t('stats.awards.sublabel') },
  ];
  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[70vh]">
        <Image
          src="/images/about/hero.png"
          alt={t('heroAlt')}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-[50px] font-light leading-tight whitespace-pre-line">
            {t('heroHeading')}
          </h1>
        </div>
      </section>

      {/* About / Legacy */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel>{t('legacyLabel')}</SectionLabel>
            <div className="text-center mt-5">
              <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                {t('legacyHeading1')}
              </h2>
              <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                {t('legacyHeading2')}
              </h2>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={0.2}>
            <div className="mt-12 text-gray-500 text-base leading-7 tracking-wide text-center max-w-[1208px] mx-auto space-y-6">
              <p>{t('legacyP1')}</p>
              <p>{t('legacyP2')}</p>
              <p>{t('legacyP3')}</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel>{t('setsApartLabel')}</SectionLabel>
            <div className="text-center mt-5">
              <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                {t('setsApartHeading')}
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="mt-12 space-y-16">
            {featureCards.map((card, i) => (
              <div key={card.title} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
                <AnimateOnScroll>
                  <div className="lg:w-[496px]">
                    <h3 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                      {card.title}
                    </h3>
                    <p className="mt-6 text-gray-500 text-base leading-7 tracking-wide">
                      {card.description}
                    </p>
                  </div>
                </AnimateOnScroll>
                <AnimateOnScroll delay={0.2}>
                  <div className="relative w-full lg:w-[600px] aspect-[4/3]">
                    <div className="relative w-full h-full rounded-[20px] overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </AnimateOnScroll>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12">
              {/* Left text */}
              <div className="lg:w-1/2">
                <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                  {t('statsHeading')}
                </h2>
                <p className="mt-3 text-gray-500 text-base leading-7 tracking-wide max-w-[548px]">
                  {t('statsDescription')}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-0 lg:w-1/2 justify-center">
                {stats.map((stat, i) => (
                  <div key={stat.label} className="flex items-center">
                    {i > 0 && (
                      <div className="h-[180px] w-px bg-gray-200 mx-8 lg:mx-12" />
                    )}
                    <div>
                      <p className="text-[60px] md:text-[70px] font-semibold leading-none text-black">
                        <CountUp end={stat.end} suffix={stat.suffix} duration={2} />
                      </p>
                      <div className="mt-3 text-gray-500 text-lg md:text-xl leading-[26px]">
                        <p>{stat.label}</p>
                        <p>{stat.sublabel}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Why Choose Us heading */}
      <section className="py-16">
        <div className="container-narrow">
          <AnimateOnScroll>
            <SectionLabel>{t('whyChooseUsLabel')}</SectionLabel>
            <SectionHeading
              title={t('whyChooseUsHeading')}
              className="mt-5 max-w-[499px] mx-auto"
            />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Technologically Enhanced */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <Image
            src="/images/about/pattern.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="container-wide relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <AnimateOnScroll>
              <div className="lg:w-[496px]">
                <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                  {t('techEnhanced.title')}
                </h2>
                <p className="mt-6 text-gray-500 text-base leading-7 tracking-wide">
                  {t('techEnhanced.description')}
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <div className="relative w-full lg:w-[600px] aspect-[4/3]">
                <div className="relative w-full h-full rounded-[20px] overflow-hidden">
                  <Image
                    src="/images/about/tech-enhanced.png"
                    alt={t('techEnhanced.imageAlt')}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Experienced Team */}
      <section className="py-20 overflow-hidden">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <AnimateOnScroll>
              <div className="relative w-full lg:w-[600px] aspect-[4/3]">
                <div className="relative w-full h-full rounded-[20px] overflow-hidden">
                  <Image
                    src="/images/about/experienced-team.png"
                    alt={t('experiencedTeam.imageAlt')}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <div className="lg:w-[557px]">
                <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                  {t('experiencedTeam.title')}
                </h2>
                <p className="mt-6 text-gray-500 text-base leading-7 tracking-wide">
                  {t('experiencedTeam.description')}
                </p>
                <div className="mt-8">
                  <Button href="/about/our-team" variant="outline">
                    {t('experiencedTeam.cta')}
                  </Button>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Large Investor Network */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <Image
            src="/images/about/pattern.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="container-wide relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <AnimateOnScroll>
              <div className="lg:w-[572px]">
                <h2 className="text-[28px] md:text-[32px] font-normal leading-[48px] text-black">
                  {t('investorNetwork.title')}
                </h2>
                <p className="mt-6 text-gray-500 text-base leading-7 tracking-wide">
                  {t('investorNetwork.description')}
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <div className="relative w-full lg:w-[600px] aspect-[4/3]">
                <div className="relative w-full h-full rounded-[20px] overflow-hidden">
                  <Image
                    src="/images/about/investor-network.png"
                    alt={t('investorNetwork.imageAlt')}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </>
  );
}
