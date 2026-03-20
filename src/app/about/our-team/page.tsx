import type { Metadata } from 'next';
import Link from 'next/link';
import { getTeam } from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import TeamGrid from '@/components/sections/TeamGrid';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Our Team - Dubai Real Estate Experts',
  description:
    'Meet the BlackOak Real Estate team. Experienced real estate consultants, investment advisors & property specialists serving Dubai and global clients.',
  alternates: { canonical: 'https://blackoak-re.com/about/our-team/' },
  openGraph: {
    title: 'Our Team - Dubai Real Estate Experts',
    description:
      'Meet the BlackOak Real Estate team. Experienced real estate consultants, investment advisors & property specialists serving Dubai and global clients.',
    type: 'website',
    url: 'https://blackoak-re.com/about/our-team/',
    images: [{ url: 'https://blackoak-re.com/images/og-default.jpg', width: 1200, height: 630, alt: 'BlackOak Real Estate Team' }],
  },
};

export default function OurTeamPage() {
  const team = getTeam();
  const partners = team.filter((m) => m.category === 'partner');
  const realEstateTeam = team.filter((m) => m.category === 'real-estate');
  const creativeTeam = team.filter((m) => m.category === 'creative-ops');

  return (
    <>
      {/* Hero / Intro */}
      <section className="pt-32 pb-10 bg-black">
        <div className="container-wide text-center">
          <AnimateOnScroll>
            <SectionLabel light>OUR TEAM</SectionLabel>
            <h1 className="text-4xl md:text-[50px] font-light leading-tight text-white mt-5">
              Our Real Estate Experts
            </h1>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Description */}
      <section className="py-12">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center max-w-[983px] mx-auto text-gray-500 text-base leading-7 tracking-wide space-y-6">
              <p>
                Covering key markets and prime communities, the BlackOak team brings together experienced property advisors dedicated to delivering exceptional real estate solutions. Our specialists provide expertise across luxury residential and commercial sales, leasing, investments, off-plan opportunities, and tailored property services. Browse our team to connect with the right expert for your real estate needs.
              </p>
              <p>
                Looking for professional real estate guidance? Call us at{' '}
                <Link href="tel:+97143989055" className="font-bold text-black">
                  +971 4 398 9055
                </Link>{' '}
                to speak with our team, or{' '}
                <Link href="/contact" className="font-bold text-black">
                  contact us
                </Link>{' '}
                today to discover opportunities tailored to you.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Partners */}
      <section className="py-10">
        <div className="container-wide">
          <AnimateOnScroll>
            <TeamGrid members={partners} columns={2} centered />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Real Estate Team */}
      <section className="py-10">
        <div className="container-wide">
          <AnimateOnScroll>
            <TeamGrid members={realEstateTeam} />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Creative & Operations Team */}
      <section className="py-16">
        <div className="container-wide">
          <AnimateOnScroll>
            <TeamGrid members={creativeTeam} title="Creative & Operations Team" />
          </AnimateOnScroll>
        </div>
      </section>
    </>
  );
}
