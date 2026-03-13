import type { Metadata } from 'next';
import Image from 'next/image';
import { TrendingUp, FileCheck, Building, Landmark } from 'lucide-react';
import HeroSection from '@/components/sections/HeroSection';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Buyers Guide',
  description: 'Start your Dubai property journey with confidence. A comprehensive buyers guide.',
};

const guides = [
  { title: 'Why Invest or Buy', icon: TrendingUp, description: "Discover why Dubai is one of the world's most attractive property markets." },
  { title: 'Obtaining a Visa', icon: FileCheck, description: 'Learn about visa options available to property investors and homeowners.' },
  { title: 'Managing Your Property', icon: Building, description: 'Understand property management options and services available.' },
  { title: 'Mortgaging Your Property', icon: Landmark, description: 'Explore financing options for your Dubai property purchase.' },
];

export default function BuyersPage() {
  return (
    <>
      <HeroSection
        title="Built on Trust.\nDriven by Passion."
        label="PROPERTY BUYERS GUIDE"
        image="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=80"
        height="large"
      />

      <section className="py-20">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>PROPERTY BUYERS GUIDE</SectionLabel>
            <SectionHeading
              title="Start your Dubai property journey with confidence."
              className="mt-4 mb-6"
            />
            <p className="text-gray-600">
              Our Property Buyers Guide offers a comprehensive overview of the entire acquisition journey — from selecting the right development and understanding market trends to navigating legal procedures and finalizing ownership.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Guide Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map((guide, i) => (
              <AnimateOnScroll key={guide.title} delay={i * 0.1}>
                <div className="bg-white p-6 text-center h-full">
                  <guide.icon className="w-10 h-10 mx-auto mb-4 text-gold" />
                  <h3 className="text-lg font-semibold mb-2">{guide.title}</h3>
                  <p className="text-sm text-gray-600">{guide.description}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Why invest content */}
      <section className="py-20">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimateOnScroll>
              <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1546412414-e1885259563a?w=800&q=80" alt="Dubai skyline" fill className="object-cover" />
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll delay={0.2}>
              <div>
                <SectionLabel className="justify-start">MARKET OVERVIEW</SectionLabel>
                <h2 className="text-3xl font-semibold mt-4 mb-6">
                  Why You Should Invest or Buy Property in Dubai
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Over the past few years, Dubai&apos;s real estate market has greatly matured, aligning itself with the established cities. Dubai is still considered a &apos;new&apos; city and most real estate projects aren&apos;t even 10 years old. However, this is a great benefit for buyers as buildings are designed and constructed with newer design concepts, advanced engineering techniques and generally, better construction.
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Invest with Confidence */}
      <section className="py-20 bg-gray-50">
        <div className="container-narrow">
          <AnimateOnScroll>
            <SectionLabel>INVEST WITH CONFIDENCE</SectionLabel>
            <SectionHeading
              title="Invest with Assured Confidence"
              className="mt-4 mb-8"
            />
            <div className="text-gray-600 space-y-4">
              <p>
                With any real estate investment, risk must be carefully evaluated and strategically managed. In Dubai, however, the risk profile remains comparatively minimal — supported by transparent regulatory frameworks, strong institutional fundamentals, and consistent global investor interest.
              </p>
              <p>
                Investors benefit from access to exceptional high-quality assets in a market that continues to deliver competitive yields — returns that, in many major global cities, would typically be significantly lower.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
