import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getCareers } from '@/lib/content';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';

export const metadata: Metadata = {
  title: 'Career',
  description: 'Join BlackOak Real Estate. Explore career opportunities in luxury real estate.',
};

const whyJoinCards = [
  {
    label: 'BlackOak',
    title: 'Career',
    image: '/images/career/card-career.png',
    description: 'Our company is dedicated to providing an environment where you can grow, learn, and thrive in your career, making each day at work a step towards success.',
  },
  {
    label: 'BlackOak',
    title: 'Wealth',
    image: '/images/career/card-wealth.png',
    description: 'Your path to wealth begins with us, as we provide rewarding career opportunities and investments in your financial wellness.',
  },
  {
    label: 'BlackOak',
    title: 'Lifestyle',
    image: '/images/career/card-lifestyle.png',
    description: 'Joining our team means you\u2019ll have the support and flexibility to create a lifestyle that aligns with your values, ensuring both personal and professional fulfilment.',
  },
];

const galleryImages = [
  '/images/career/gallery-1.png',
  '/images/career/gallery-2.png',
  '/images/career/gallery-3.png',
  '/images/career/gallery-4.png',
  '/images/career/gallery-5.png',
  '/images/career/gallery-6.png',
  '/images/career/gallery-7.png',
  '/images/career/gallery-8.png',
  '/images/career/gallery-9.png',
  '/images/career/gallery-5.png',
];

function formatPostedDate(dateStr: string) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function CareerPage() {
  const careers = getCareers();

  return (
    <>
      {/* Header Label + Heading */}
      <section className="pt-[156px] pb-8">
        <div className="container-narrow text-center">
          <SectionLabel>Career</SectionLabel>
          <SectionHeading
            title="A glimpse into our people, partners, and life at BlackOak."
            className="mt-5"
          />
        </div>
      </section>

      {/* Hero Banner */}
      <section className="relative w-full h-[450px] overflow-hidden">
        <Image
          src="/images/career/hero.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-[224px] bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[480px] bg-gradient-to-t from-[rgba(7,35,75,0.9)] to-transparent" />
      </section>

      {/* Intro Text */}
      <section className="py-16">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-[16px] font-normal leading-[28px] tracking-[0.16px] text-[#5f6368] text-center max-w-[1382px] mx-auto space-y-6">
              <p>
                BlackOak Real Estate stands as a premier international property company specializing in facilitating connections between global and local buyers with exclusive properties in Dubai. Our team of experienced agents are known for their expertise, knowledge, diligence and unwavering commitment to enhance the customer journey.
              </p>
              <p>
                Together, we have successfully executed real estate transactions worth billions of dollars, forging robust partnerships with renowned developers across the UAE and throughout the Middle East region. Our extensive network enables us to give our clients a unique, tailor made service that aligns specifically to their personable requirements.
              </p>
              <p>
                As part of our manpower commitment, we don&apos;t just provide jobs, we guarantee careers, and it&apos;s for this reason, that we are now looking to expand our sales team. With this in mind, our mission is to recruit experienced real estate agents who wish to be part of the BlackOak journey.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Why Join Our Team - Dark Section */}
      <section className="py-20 bg-black">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-12">
              <SectionLabel light>Why join our team</SectionLabel>
              <SectionHeading
                title="Join a Standard Few Can Reach"
                light
                className="mt-5"
              />
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
            {whyJoinCards.map((card, i) => (
              <AnimateOnScroll key={card.title} delay={i * 0.15}>
                <div className="flex flex-col gap-5">
                  <div className="relative w-full aspect-square overflow-hidden">
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-6 left-[22px]">
                      <p className="text-[20px] font-light leading-[48px] text-white">
                        &nbsp;{card.label}
                      </p>
                      <p className="text-[50px] font-light leading-[48px] text-white">
                        {card.title}
                      </p>
                    </div>
                  </div>
                  <p className="text-[16px] font-normal leading-[1.5] tracking-[0.16px] text-[#e2e2e2] max-w-[439px]">
                    {card.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Openings */}
      <section className="pb-6 pt-20">
        <div className="container-narrow text-center">
          <AnimateOnScroll>
            <SectionLabel>Explore Openings</SectionLabel>
            <SectionHeading
              title="Find the right job for you"
              className="mt-5"
            />
          </AnimateOnScroll>
        </div>
      </section>

      {/* Job Listings */}
      <section className="pb-20">
        <div className="max-w-[1080px] mx-auto px-6">
          {careers.map((job, i) => (
            <AnimateOnScroll key={job.slug} delay={i * 0.1}>
              <div className="border-t border-b border-[#ccc] py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <h3 className="text-[20px] font-semibold leading-[20px] text-black">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-[10px] text-[14px] font-normal text-[#5f6368]">
                    <span className="flex items-center gap-[5px]">
                      <MapPin className="w-[14px] h-[14px]" />
                      {job.location}
                    </span>
                    <span className="text-[#ccc]">|</span>
                    <span>{job.department}</span>
                    <span className="text-[#ccc]">|</span>
                    <span>Posted on : {formatPostedDate(job.postedDate)}</span>
                  </div>
                </div>
                <Link
                  href={`/career/${job.slug}`}
                  className="bg-black border-2 border-black text-white text-[12px] font-medium uppercase tracking-wider h-[48px] w-[160px] flex items-center justify-center hover:bg-gray-900 transition-colors shrink-0"
                >
                  View Details
                </Link>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* Life at BlackOak - Photo Gallery */}
      <section className="py-20">
        <div className="container-narrow text-center mb-12">
          <AnimateOnScroll>
            <SectionLabel>Life at BlackOak</SectionLabel>
            <SectionHeading
              title="A glimpse into the people, partnerships, and premium developments"
              className="mt-5 max-w-[604px] mx-auto"
            />
          </AnimateOnScroll>
        </div>

        <div className="overflow-hidden">
          <div className="flex flex-col gap-[10px]">
            {/* Row 1 */}
            <div className="flex gap-[10px] justify-center">
              {galleryImages.slice(0, 5).map((img, i) => (
                <div key={i} className="relative w-[396px] h-[360px] shrink-0 overflow-hidden rounded-sm">
                  <Image
                    src={img}
                    alt={`Life at BlackOak ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="396px"
                  />
                </div>
              ))}
            </div>
            {/* Row 2 */}
            <div className="flex gap-[10px] justify-center">
              {galleryImages.slice(5, 10).map((img, i) => (
                <div key={i} className="relative w-[396px] h-[360px] shrink-0 overflow-hidden rounded-sm">
                  <Image
                    src={img}
                    alt={`Life at BlackOak ${i + 6}`}
                    fill
                    className="object-cover"
                    sizes="396px"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
