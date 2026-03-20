import type { Metadata } from 'next';
import Image from 'next/image';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import Accordion from '@/components/ui/Accordion';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Dubai Property Investment Opportunities',
  description:
    'Exclusive access to institutional-grade real estate investments in Dubai. Syndicated deals, high ROI opportunities & expert advisory for HNW investors.',
  alternates: { canonical: 'https://blackoak-re.com/insights/investors/' },
  openGraph: {
    title: 'Dubai Property Investment Opportunities | BlackOak',
    description:
      'Exclusive access to institutional-grade real estate investments in Dubai. Syndicated deals, high ROI opportunities & expert advisory.',
    type: 'website',
    url: 'https://blackoak-re.com/insights/investors/',
    images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: 'Dubai Property Investment with BlackOak' }],
  },
};

const sections = [
  {
    title: 'Syndicated Real Estate Investments in Dubai',
    description:
      'At BlackOak Real Estate, investors benefit from access to carefully structured syndicated investment opportunities across Dubai\u2019s dynamic property market. These offerings enable both qualified and retail investors to participate in institutional-quality transactions that include residential, commercial, and mixed-use assets. Each opportunity emphasizes project-driven returns supported by tangible real estate fundamentals.',
    image: '/images/investors/syndicated.png',
    imagePosition: 'left' as const,
  },
  {
    title: 'Tailored Strategies and Advisory',
    description:
      'With a consultative team, BlackOak guides investors in identifying and accessing products designed to meet their goals, whether they seek income stability, capital growth, or a blend of exposures.\n\nAdditionally, BlackOak is introducing a suite of real estate-backed investment options and co-investment syndicates, designed to deliver secure and transparent participation in Dubai\u2019s most compelling property opportunities.',
    image: '/images/investors/tailored.jpg',
    imagePosition: 'right' as const,
  },
  {
    title: 'Institutional Expertise, Boutique Precision',
    description:
      'Our leadership team combines extensive institutional experience in acquisitions, development management, capital structuring, and investment strategy. This expertise allows us to identify and structure investments that fit changing market cycles and individual investor objectives, always with disciplined risk management.\n\nBlackOak\u2019s strong understanding of Dubai\u2019s real estate landscape, from land acquisition through to project feasibility and exit strategy, bridges the gap between private capital and institutional grade real estate assets.',
    image: '/images/investors/institutional.png',
    imagePosition: 'left' as const,
  },
  {
    title: 'Collaborative Syndication Approach',
    description:
      'Our syndicated investment platform unites investors in exclusive real estate ventures. This approach opens access to projects and strategies typically reserved for larger institutional players, supported by professional governance, transparency, and robust reporting standards.\n\nEach transaction is evaluated independently, focusing on solid asset fundamentals, sensible capital structures, clear exit visibility, and strong alignment among sponsors, developers, and investors. Conservative, risk-adjusted return targets remain central to every investment.',
    image: '/images/investors/tailored.jpg',
    imagePosition: 'right' as const,
  },
];

const faq = [
  {
    question: 'Why should I invest in Dubai real estate?',
    answer:
      'Dubai offers tax-free rental income, strong capital appreciation, world-class infrastructure, and a stable regulatory environment. The city consistently ranks among the top global destinations for property investment.',
  },
  {
    question: 'What types of properties offer the best returns?',
    answer:
      'Returns vary depending on location, developer reputation, and market timing. Prime waterfront developments, branded residences, and high-demand off-plan projects often deliver strong capital appreciation, while completed properties in established communities can generate stable rental yields. A strategic, data-driven approach ensures optimal portfolio performance.',
  },
  {
    question: 'Is off-plan investment a good strategy?',
    answer:
      'Off-plan investments can offer significant advantages including lower entry prices, flexible payment plans, and potential for capital appreciation before completion.',
  },
  {
    question: 'Can international investors purchase property in Dubai?',
    answer:
      'Yes, Dubai offers freehold property ownership to international investors in designated areas, which include most premium developments and communities.',
  },
];

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

export default function InvestorsPage() {
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
          alt="Dubai real estate investment opportunities with premium skyline view"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-[224px] bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[480px] bg-gradient-to-t from-black/90 to-transparent" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-[50px] font-light leading-tight">
            Built on Trust.<br />Driven by Passion.
          </h1>
        </div>
      </section>

      {/* Why BlackOak? */}
      <section className="py-20">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>Why BlackOak?</SectionLabel>
            <SectionHeading
              title="Exclusive access to Dubai's most exceptional real estate opportunities."
              className="mt-5"
            />
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <div className="mt-8 text-[16px] leading-[28px] tracking-[0.16px] text-[#5f6368] max-w-[1216px] mx-auto space-y-6">
              <p>
                Investors choose BlackOak for institutional-grade due diligence, disciplined asset management, transparent structures, and clear investor reporting. Our platform gives access to premium developments and off-market transactions. Alignment is ensured through direct co-investment by BlackOak principals.
              </p>
              <p>
                BlackOak blends institutional rigor with boutique agility, giving investors the confidence to participate in Dubai&apos;s evolving real estate market through professionally managed, asset-backed investment platforms.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Invest with Blackoak */}
      <section className="py-16">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>Invest with Blackoak</SectionLabel>
            <SectionHeading
              title="Where Capital Meets Opportunity"
              className="mt-5"
            />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Alternating content sections */}
      {sections.map((section) => (
        <section key={section.title} className="py-16">
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
            <SectionLabel>FAQs</SectionLabel>
            <SectionHeading
              title="Everything you need to know about investing with clarity"
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
