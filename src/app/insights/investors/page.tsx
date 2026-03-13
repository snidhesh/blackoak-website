import type { Metadata } from 'next';
import Image from 'next/image';
import HeroSection from '@/components/sections/HeroSection';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import Accordion from '@/components/ui/Accordion';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Investors',
  description: 'Exclusive access to Dubai\'s most exceptional real estate investment opportunities.',
};

const sections = [
  {
    title: 'Syndicated Real Estate Investments in Dubai',
    description: 'Collective from strategy: a curated approach that opens doors to outstanding property investments that might otherwise remain inaccessible. Our model enables qualified investors to participate in premium developments with reduced individual capital requirements.',
    image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80',
    imagePosition: 'right' as const,
  },
  {
    title: 'Tailored Strategies and Advisory',
    description: 'Every investor\'s goals are unique. BlackOak\'s team builds customized investment strategies aligned with your risk appetite, return expectations, and timeline. Whether you\'re focused on capital appreciation, rental yield, or portfolio diversification, we create a roadmap tailored to your ambitions.',
    image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80',
    imagePosition: 'left' as const,
  },
  {
    title: 'Institutional Expertise, Boutique Precision',
    description: 'We blend the analytics and due diligence of institutional investors with the personalized service of a boutique firm. Every recommendation is backed by thorough market analysis, financial modeling, and on-the-ground intelligence.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
    imagePosition: 'right' as const,
  },
  {
    title: 'Collaborative Syndication Approach',
    description: 'Our syndication model brings together a select group of investors to co-invest in high-value properties. This reduces individual capital requirements while maximizing access to premium developments.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80',
    imagePosition: 'left' as const,
  },
];

const faq = [
  {
    question: 'Why should I invest in Dubai real estate?',
    answer: 'Dubai offers tax-free rental income, strong capital appreciation, world-class infrastructure, and a stable regulatory environment. The city consistently ranks among the top global destinations for property investment.',
  },
  {
    question: 'What types of properties offer the best returns?',
    answer: 'Off-plan properties in premium locations typically offer the strongest returns. However, the best investment depends on your goals — whether capital appreciation, rental yield, or a combination of both.',
  },
  {
    question: 'Is off-plan investment a good strategy?',
    answer: 'Off-plan investments can offer significant advantages including lower entry prices, flexible payment plans, and potential for capital appreciation before completion.',
  },
  {
    question: 'Can international investors buy property in Dubai?',
    answer: 'Yes, Dubai offers freehold property ownership to international investors in designated areas, which include most premium developments and communities.',
  },
];

export default function InvestorsPage() {
  return (
    <>
      <HeroSection
        title="Built on Trust.\nDriven by Passion."
        label="INVESTORS"
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80"
        height="large"
      />

      <section className="py-20">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>EXCLUSIVE ACCESS</SectionLabel>
            <SectionHeading
              title="Exclusive access to Dubai's most exceptional real estate opportunities."
              className="mt-4 mb-6"
            />
            <p className="text-gray-600">
              Dubai&apos;s world-class infrastructure, tax-advantaged environment, and consistently strong rental yields make it one of the most compelling property investment destinations globally.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Alternating content sections */}
      {sections.map((section) => (
        <section key={section.title} className="py-16">
          <div className="container-wide">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${section.imagePosition === 'left' ? '' : 'lg:flex-row-reverse'}`}>
              <AnimateOnScroll className={section.imagePosition === 'right' ? 'lg:order-2' : ''}>
                <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                  <Image src={section.image} alt={section.title} fill className="object-cover" />
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll delay={0.2} className={section.imagePosition === 'right' ? 'lg:order-1' : ''}>
                <div>
                  <h3 className="text-2xl md:text-3xl font-semibold mb-4">{section.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{section.description}</p>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      ))}

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container-narrow">
          <AnimateOnScroll>
            <SectionHeading
              title="Everything you need to know about investing with clarity."
              className="mb-10"
            />
          </AnimateOnScroll>
          <Accordion items={faq} />
        </div>
      </section>
    </>
  );
}
