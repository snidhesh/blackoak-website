import type { Metadata } from 'next';
import Image from 'next/image';
import { MapPin, Briefcase, Clock, ArrowRight } from 'lucide-react';
import { getCareers } from '@/lib/content';
import HeroSection from '@/components/sections/HeroSection';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Career',
  description: 'Join BlackOak Real Estate. Explore career opportunities in luxury real estate.',
};

export default function CareerPage() {
  const careers = getCareers();

  return (
    <>
      <HeroSection
        title="Join a Legacy of Elevated Living"
        label="CAREER"
        image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80"
        height="medium"
      />

      <section className="py-20">
        <div className="container-narrow">
          <AnimateOnScroll>
            <p className="text-gray-600 leading-relaxed text-center">
              BlackOak Real Estate stands as a premier international luxury property brokerage, specializing in the world&apos;s most coveted destinations. Our commitment to excellence sets new standards for a lifestyle of luxury and innovation in Dubai. The depth of expertise within our team has set the benchmark for the luxury real estate market.
            </p>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-16 bg-gray-50">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionHeading title="Find the right job for you" className="mb-10" />
          </AnimateOnScroll>

          <div className="space-y-4">
            {careers.map((job, i) => (
              <AnimateOnScroll key={job.slug} delay={i * 0.1}>
                <div className="bg-white border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" /> {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {job.type}
                      </span>
                      <span>Remuneration: {job.remuneration}</span>
                    </div>
                  </div>
                  <Button href={`/career/${job.slug}`} size="sm">
                    APPLY NOW <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Lifestyle Cards - Dark section */}
      <section className="py-20 bg-dark-900 text-white">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionLabel light>WHY JOIN OUR TEAM</SectionLabel>
            <SectionHeading
              title="Join a Standard Few Can Reach"
              light
              className="mt-4 mb-12"
            />
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Career', desc: 'Our company is dedicated to providing an environment that fosters growth, development and excellence every day.', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80' },
              { title: 'Wealth', desc: 'Our plans to reward legacy with us are the premier opportunity to build extraordinary wealth from your portfolio.', image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80' },
              { title: 'Lifestyle', desc: 'Working at our team means you have the support and flexibility to design the life you want — personal and professional fulfilment.', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' },
            ].map((card, i) => (
              <AnimateOnScroll key={card.title} delay={i * 0.15}>
                <div className="relative aspect-[4/3] overflow-hidden group">
                  <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                    <p className="text-sm text-gray-300">{card.desc}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <SectionHeading
              title="A glimpse into the people, partnerships, and premium developments"
              className="mb-12"
            />
          </AnimateOnScroll>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80',
              'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=600&q=80',
              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
              'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
              'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
              'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&q=80',
              'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
              'https://images.unsplash.com/photo-1546412414-e1885259563a?w=600&q=80',
            ].map((url, i) => (
              <div key={i} className="relative aspect-square bg-gray-200 overflow-hidden">
                <Image
                  src={url}
                  alt={`Team photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
