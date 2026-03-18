import type { Metadata } from 'next';
import Image from 'next/image';
import { Check } from 'lucide-react';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import ListPropertyForm from '@/components/sections/ListPropertyForm';

export const metadata: Metadata = {
  title: 'Sell Your Property in Dubai',
  description:
    'List your property with BlackOak Real Estate. Global buyer network, professional marketing & dedicated agent support to sell or rent your Dubai property fast.',
  alternates: { canonical: 'https://blackoak-re.com/list-your-property' },
};

const benefits = [
  'International reach across global and local buyer networks',
  'Expert property valuation by seasoned market specialists',
  'Premium listing exposure on leading local and global portals',
  'Dedicated agent with personalised marketing strategy',
  'Billions of dollars in successfully executed transactions',
  'Zero upfront fees — results-driven service',
];

const steps = [
  {
    number: '01',
    title: 'Property Valuation',
    description: 'Our expert agents visit your property within 24 hours for a comprehensive market appraisal and pricing strategy.',
  },
  {
    number: '02',
    title: 'Listing & Marketing',
    description: 'Professional photography, compelling copywriting, and strategic placement across premium local and international portals.',
  },
  {
    number: '03',
    title: 'Global Exposure',
    description: 'Your property is presented to our extensive network of qualified buyers and investors across the UAE and worldwide.',
  },
  {
    number: '04',
    title: 'Seamless Closing',
    description: 'From negotiation to final paperwork, our team handles every detail ensuring a smooth and transparent transaction.',
  },
];

const stats = [
  { value: 'AED 2B+', label: 'In Transactions' },
  { value: '18+', label: 'Premium Projects' },
  { value: '13', label: 'Neighbourhoods' },
  { value: '24/7', label: 'Client Support' },
];

export default function ListYourPropertyPage() {
  return (
    <>
      {/* Header */}
      <section className="pt-[156px] pb-8">
        <div className="container-narrow text-center">
          <SectionLabel>List Your Property</SectionLabel>
          <SectionHeading
            title="Sell or Rent Your Property with Confidence"
            subtitle="Partner with Dubai's premier luxury real estate firm for unmatched exposure and expert guidance."
            className="mt-5"
          />
        </div>
      </section>

      {/* Hero Banner */}
      <section className="relative w-full h-[450px] overflow-hidden">
        <Image
          src="/images/neighbourhoods/downtown-dubai.jpg"
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
                <SectionLabel className="justify-start">Why BlackOak</SectionLabel>
                <SectionHeading
                  title="The Standard Your Property Deserves"
                  align="left"
                  className="mt-5"
                />
                <p className="mt-6 text-[16px] font-normal leading-[28px] tracking-[0.16px] text-[#5f6368]">
                  BlackOak Real Estate connects global and local buyers with exclusive properties in Dubai. Our team of experienced agents are known for their expertise, diligence, and unwavering commitment to delivering results.
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
                <h3 className="text-[24px] font-normal leading-[32px] mb-2">List Your Property Today</h3>
                <p className="text-[14px] leading-[22px] text-[#5f6368] mb-8">
                  Fill in the details below and one of our property specialists will contact you within 24 hours.
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
              <SectionLabel light>The Process</SectionLabel>
              <SectionHeading
                title="How It Works"
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
