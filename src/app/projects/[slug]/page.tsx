import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { MapPin, Bed, Maximize, Check, ExternalLink } from 'lucide-react';
import { getProjects, getProjectBySlug } from '@/lib/content';
import { formatPriceNumber } from '@/lib/formatters';
import DirhamIcon from '@/components/ui/DirhamIcon';
import SectionLabel from '@/components/ui/SectionLabel';
import ContactForm from '@/components/sections/ContactForm';
import AgentCard from '@/components/sections/AgentCard';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import StickyNav from '@/components/ui/StickyNav';

export const dynamicParams = true;
export const revalidate = 300;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: 'Project Not Found' };

  const offeringLabel = project.offering === 'sale' ? 'for Sale' : project.offering === 'rent' ? 'for Rent' : '';
  const title = `${project.name} | ${project.propertyType} ${offeringLabel} in ${project.location.address}`.trim();
  const description = `${project.name} — ${project.propertyType} ${offeringLabel} in ${project.location.address}. ${project.bedrooms} bedrooms, ${project.area.toLocaleString('en-US')} ${project.areaUnit}. ${project.description.slice(0, 120)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://blackoak-re.com/projects/${params.slug}`,
      images: [{ url: project.mainImage, alt: project.name }],
    },
    alternates: {
      canonical: `https://blackoak-re.com/projects/${params.slug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const hasCoordinates = project.location.lat !== 0 && project.location.lng !== 0;
  const hasFloorPlans = project.floorPlans.length > 0;

  const stickyNavSections = [
    { id: 'details', label: 'Details' },
    { id: 'gallery', label: 'Gallery' },
    ...(hasFloorPlans ? [{ id: 'floor-plans', label: 'Floor Plans' }] : []),
    { id: 'amenities', label: 'Amenities' },
    { id: 'location', label: 'Location' },
    { id: 'enquiry', label: 'Enquiry' },
  ];

  const listingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: project.name,
    description: project.description,
    url: `https://blackoak-re.com/projects/${params.slug}`,
    image: project.mainImage,
    datePosted: new Date().toISOString().split('T')[0],
    offers: {
      '@type': 'Offer',
      price: project.price,
      priceCurrency: 'AED',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }}
      />
      {/* Hero */}
      <section className="relative h-[800px] flex items-end overflow-hidden">
        <Image
          src={project.mainImage}
          alt={project.name}
          fill
          className="object-cover"
          priority
        />
        {/* Top gradient for navbar */}
        <div className="absolute inset-x-0 top-0 h-[188px] bg-gradient-to-b from-black/50 to-transparent" />
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-[400px] bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 container-wide pb-12 w-full">
          <div className="flex items-end justify-between">
            {/* Left side: Name, Location, Specs */}
            <div>
              <h1 className="text-[50px] font-light leading-tight text-white">
                {project.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-3 text-white">
                <MapPin className="w-4 h-4" />
                <span className="text-base">{project.location.address}</span>
              </div>
              <div className="flex items-center gap-2.5 mt-3 text-white text-base font-medium">
                <span className="flex items-center gap-1.5">
                  <Bed className="w-5 h-5" />
                  {project.bedrooms} Bedrooms
                </span>
                <span className="w-1 h-1 rounded-full bg-white/60" />
                <span className="flex items-center gap-1.5">
                  <Maximize className="w-[18px] h-[18px]" />
                  {project.area.toLocaleString()} {project.areaUnit}
                </span>
              </div>
            </div>

            {/* Right side: Price + CTAs */}
            <div className="text-right">
              <p className="text-[13px] text-white/80 uppercase tracking-wider">
                Price Starting From
              </p>
              <div className="flex items-center justify-end gap-2 mt-2">
                <DirhamIcon size={20} className="invert shrink-0" />
                <span className="text-[28px] font-semibold text-white">
                  {formatPriceNumber(project.price)}
                </span>
              </div>
              <div className="flex items-center gap-5 mt-4">
                <a
                  href="#enquiry"
                  className="flex items-center justify-center w-[200px] h-[48px] bg-black border-2 border-black text-white text-xs font-medium uppercase tracking-wider hover:bg-gray-900 transition-colors"
                >
                  Register Interest
                </a>
                <a
                  href="#enquiry"
                  className="flex items-center justify-center w-[200px] h-[48px] bg-white border-2 border-black text-black text-xs font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors"
                >
                  Request Callback
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Section Nav */}
      <StickyNav sections={stickyNavSections} />

      {/* Details */}
      <section id="details" className="py-16">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-10">
              <SectionLabel>Details</SectionLabel>
              <h2 className="text-[32px] font-light mt-5">
                Where Luxury Meets the Horizon
              </h2>
            </div>
            <p className="text-[#5f6368] text-base leading-[28px] tracking-[0.16px] whitespace-pre-line">
              {project.description}
            </p>

            {/* Additional details from CRM */}
            {(project.reference || project.furnishingType || (project.parkingSlots && project.parkingSlots > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
                {project.reference && (
                  <div>
                    <p className="text-sm font-medium text-black">Reference</p>
                    <p className="text-sm text-[#5f6368] mt-1">{project.reference}</p>
                  </div>
                )}
                {project.furnishingType && (
                  <div>
                    <p className="text-sm font-medium text-black">Furnishing</p>
                    <p className="text-sm text-[#5f6368] mt-1">{project.furnishingType}</p>
                  </div>
                )}
                {project.parkingSlots !== undefined && project.parkingSlots > 0 && (
                  <div>
                    <p className="text-sm font-medium text-black">Parking</p>
                    <p className="text-sm text-[#5f6368] mt-1">{project.parkingSlots} slot{project.parkingSlots !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </div>
            )}
          </AnimateOnScroll>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-16">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-10">
              <SectionLabel>Gallery</SectionLabel>
              <h2 className="text-[32px] font-light mt-5">
                A Visual Symphony of Luxury
              </h2>
            </div>
          </AnimateOnScroll>
          {/* Mosaic: large left + 2x2 right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Large image */}
            <div className="relative aspect-[4/3] lg:row-span-2 bg-gray-200 overflow-hidden">
              <Image
                src={project.mainImage}
                alt={`${project.name} main`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Smaller images */}
            {project.gallery.slice(0, 4).map((img, i) => (
              <div key={i} className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                <Image
                  src={img}
                  alt={`${project.name} gallery ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floor Plans — conditional */}
      {hasFloorPlans && (
        <section id="floor-plans" className="py-16">
          <div className="container-wide">
            <AnimateOnScroll>
              <div className="text-center mb-10">
                <SectionLabel>Floor Plans</SectionLabel>
                <h2 className="text-[32px] font-light mt-5">
                  Layouts Designed Around Your Life
                </h2>
              </div>
            </AnimateOnScroll>
            <div className="flex flex-col lg:flex-row items-start gap-12">
              {/* Room breakdown */}
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-base font-medium text-black leading-[26px]">
                    Bedrooms &amp; Private Suites :
                  </p>
                  <p className="text-[#5f6368] text-base tracking-[0.16px] leading-[28px]">
                    {project.bedrooms} Bedrooms | {project.bathrooms} Bathrooms
                  </p>
                </div>
                <div>
                  <p className="text-base font-medium text-black leading-[26px]">
                    Total Area :
                  </p>
                  <p className="text-[#5f6368] text-base tracking-[0.16px] leading-[28px]">
                    {project.area.toLocaleString()} {project.areaUnit}
                  </p>
                </div>
                <div>
                  <p className="text-base font-medium text-black leading-[26px]">
                    Developer :
                  </p>
                  <p className="text-[#5f6368] text-base tracking-[0.16px] leading-[28px]">
                    {project.developer}
                  </p>
                </div>
              </div>
              {/* Floor plan image */}
              <div className="flex-1 relative aspect-[656/358] w-full bg-gray-100 overflow-hidden">
                <Image
                  src={project.floorPlans[0].image}
                  alt={project.floorPlans[0].name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Amenities - Black Background */}
      {project.amenities.length > 0 && (
        <section id="amenities" className="py-20 bg-black">
          <div className="container-wide">
            <AnimateOnScroll>
              <div className="text-center mb-14">
                <SectionLabel light>Amenities</SectionLabel>
                <h2 className="text-[32px] font-light text-white mt-5">
                  Where Every Desire is Anticipated
                </h2>
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-40 gap-y-3">
              {project.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-white/70 shrink-0" />
                  <span className="text-[#e2e2e2] text-base leading-[28px] tracking-[0.16px]">
                    {amenity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location */}
      <section id="location" className="py-20 bg-black">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-10">
              <SectionLabel light>Location</SectionLabel>
              <h2 className="text-[32px] font-light text-white mt-5">
                Positioned at the Pinnacle of Prestige
              </h2>
            </div>
          </AnimateOnScroll>
          {hasCoordinates ? (
            <div className="relative aspect-[1382/505] bg-gray-800 overflow-hidden rounded">
              <iframe
                src={`https://www.google.com/maps?q=${project.location.lat},${project.location.lng}&z=15&output=embed`}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${project.name} location`}
              />
            </div>
          ) : (
            <div className="bg-gray-900 rounded p-8 text-center">
              <MapPin className="w-8 h-8 text-white/60 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">{project.location.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors mt-2"
              >
                View on Google Maps <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquiry" className="py-20 bg-[#f0f3f8]">
        <div className="container-narrow">
          <AnimateOnScroll>
            <div className="text-center mb-10">
              <SectionLabel>Enquiry</SectionLabel>
              <h2 className="text-[32px] font-light mt-5">
                Your Dream Residence Awaits —{' '}
                <br className="hidden md:block" />
                Let&apos;s Connect
              </h2>
            </div>
          </AnimateOnScroll>

          {/* Agent Card */}
          {project.agent && (
            <div className="mb-8">
              <AgentCard agent={project.agent} />
            </div>
          )}

          <ContactForm
            endpoint="/api/project-enquiry"
            projectSlug={project.slug}
            projectName={project.name}
            submitLabel="Submit Enquiry"
          />
        </div>
      </section>
    </>
  );
}
