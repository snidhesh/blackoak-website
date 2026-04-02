import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { MapPin, Bed, Maximize, Check, ExternalLink } from 'lucide-react';
import { getProjects, getProjectBySlug } from '@/lib/content';
import { formatArea } from '@/lib/formatters';
import { getProjectName, getProjectDescription } from '@/lib/crm-transform';
import type { Locale } from '@/i18n/config';
import FormattedPrice from '@/components/ui/FormattedPrice';
import SectionLabel from '@/components/ui/SectionLabel';
import ContactForm from '@/components/sections/ContactForm';
import AgentCard from '@/components/sections/AgentCard';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import StickyNav from '@/components/ui/StickyNav';

export const dynamicParams = true;
export const revalidate = 300;

interface Props {
  params: { slug: string; locale: string };
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  const locale = params.locale as Locale;
  const tMeta = await getTranslations({ locale, namespace: 'metadata.projectDetail' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  if (!project) return { title: tMeta('notFoundTitle') };

  const name = getProjectName(project, locale);
  const desc = getProjectDescription(project, locale);
  const offeringLabel = project.offering === 'sale' ? tMeta('forSale') : project.offering === 'rent' ? tMeta('forRent') : '';
  const title = `${name} | ${project.propertyType} ${offeringLabel} in ${project.location.address}`.trim();
  const description = `${name} — ${project.propertyType} ${offeringLabel} in ${project.location.address}. ${project.bedrooms} ${tCommon('bedrooms')}, ${formatArea(project.area, locale)} ${project.areaUnit}. ${desc.slice(0, 120)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://blackoak-re.com/projects/${params.slug}/`,
      images: [{ url: project.mainImage, alt: name }],
    },
    alternates: {
      canonical: `https://blackoak-re.com/projects/${params.slug}/`,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.projectDetail' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const projectName = getProjectName(project, locale);
  const projectDescription = getProjectDescription(project, locale);

  const hasCoordinates = project.location.lat !== 0 && project.location.lng !== 0;
  const hasFloorPlans = project.floorPlans.length > 0;

  const stickyNavSections = [
    { id: 'details', label: t('stickyNav.details') },
    { id: 'gallery', label: t('stickyNav.gallery') },
    ...(hasFloorPlans ? [{ id: 'floor-plans', label: t('stickyNav.floorPlans') }] : []),
    { id: 'amenities', label: t('stickyNav.amenities') },
    { id: 'location', label: t('stickyNav.location') },
    { id: 'enquiry', label: t('stickyNav.enquiry') },
  ];

  const allImages = [project.mainImage, ...project.gallery];

  const listingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: projectName,
    description: projectDescription,
    url: `https://blackoak-re.com/projects/${params.slug}/`,
    image: allImages,
    datePosted: project.availableFrom || new Date().toISOString().split('T')[0],
    offers: {
      '@type': 'Offer',
      price: project.price,
      priceCurrency: 'AED',
      availability: 'https://schema.org/InStock',
    },
    ...(project.propertyType && { '@additionalType': project.propertyType }),
    numberOfRooms: project.bedrooms,
    numberOfBathroomsTotal: project.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: project.area,
      unitText: project.areaUnit,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: project.location.address,
      addressLocality: 'Dubai',
      addressCountry: 'AE',
    },
    ...(hasCoordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: project.location.lat,
        longitude: project.location.lng,
      },
    }),
    ...(project.amenities.length > 0 && { amenityFeature: project.amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a })) }),
    ...(project.agent && {
      broker: {
        '@type': 'RealEstateAgent',
        name: project.agent.name,
        email: project.agent.email,
        telephone: project.agent.phone,
        ...(project.agent.profileImage && { image: project.agent.profileImage }),
      },
    }),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('breadcrumbs.home'), item: 'https://blackoak-re.com' },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbs.projects'), item: 'https://blackoak-re.com/projects' },
      { '@type': 'ListItem', position: 3, name: projectName, item: `https://blackoak-re.com/projects/${params.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Hero */}
      <section className="relative h-[520px] md:h-[700px] lg:h-[800px] flex items-end overflow-hidden">
        <Image
          src={project.mainImage}
          alt={projectName}
          fill
          className="object-cover"
          priority
        />
        {/* Top gradient for navbar */}
        <div className="absolute inset-x-0 top-0 h-[188px] bg-gradient-to-b from-black/50 to-transparent" />
        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="relative z-10 container-wide pb-8 md:pb-12 w-full">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            {/* Left side: Name, Location, Specs */}
            <div className="min-w-0">
              <h1 className="text-[24px] md:text-[36px] lg:text-[42px] font-light leading-[1.2] text-white">
                {projectName}
              </h1>
              <div className="flex items-center gap-1.5 mt-2 md:mt-3 text-white/90">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                <span className="text-[13px] md:text-base">{project.location.address}</span>
              </div>
      <div className="flex items-center gap-2.5 mt-2 md:mt-3 text-white/90 text-[13px] md:text-base font-medium">
                <span className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4 md:w-5 md:h-5" />
                  {project.bedrooms} {tCommon('bed')}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/60" />
                <span className="flex items-center gap-1.5">
                  <Maximize className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  {formatArea(project.area, locale)} {project.areaUnit}
                </span>
              </div>
            </div>

            {/* Right side: Price + CTAs */}
            <div className="md:text-end shrink-0">
              <p className="text-[11px] md:text-[13px] text-white/70 uppercase tracking-wider">
                {tCommon('priceStartingFrom')}
              </p>
              <div className="flex items-center md:justify-end gap-2 mt-1">
                <span className="text-[22px] md:text-[28px] font-semibold text-white">
                  <FormattedPrice price={project.price} size="lg" light />
                </span>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <a
                  href="#enquiry"
                  className="flex items-center justify-center flex-1 md:flex-none md:w-[180px] h-[44px] md:h-[48px] bg-black border-2 border-black text-white text-[11px] md:text-xs font-medium uppercase tracking-wider hover:bg-gray-900 transition-colors"
                >
                  {tCommon('registerInterest')}
                </a>
                <a
                  href="#enquiry"
                  className="flex items-center justify-center flex-1 md:flex-none md:w-[180px] h-[44px] md:h-[48px] bg-white border-2 border-black text-black text-[11px] md:text-xs font-medium uppercase tracking-wider hover:bg-gray-100 transition-colors"
                >
                  {tCommon('requestCallback')}
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
              <SectionLabel>{t('details.label')}</SectionLabel>
              <h2 className="text-[32px] font-light mt-5">
                {t('details.heading')}
              </h2>
            </div>
            <p className="text-[#5f6368] text-base leading-[28px] tracking-[0.16px] whitespace-pre-line">
              {projectDescription}
            </p>

            {/* Additional details from CRM */}
            {(project.reference || project.furnishingType || (project.parkingSlots && project.parkingSlots > 0)) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
                {project.reference && (
                  <div>
                    <p className="text-sm font-medium text-black">{t('details.reference')}</p>
                    <p className="text-sm text-[#5f6368] mt-1">{project.reference}</p>
                  </div>
                )}
                {project.furnishingType && (
                  <div>
                    <p className="text-sm font-medium text-black">{t('details.furnishing')}</p>
                    <p className="text-sm text-[#5f6368] mt-1">{project.furnishingType}</p>
                  </div>
                )}
                {project.parkingSlots !== undefined && project.parkingSlots > 0 && (
                  <div>
                    <p className="text-sm font-medium text-black">{t('details.parking')}</p>
                    <p className="text-sm text-[#5f6368] mt-1">{t('details.parkingSlots', { count: project.parkingSlots })}</p>
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
              <SectionLabel>{t('gallery.label')}</SectionLabel>
              <h2 className="text-[32px] font-light mt-5">
                {t('gallery.heading')}
              </h2>
            </div>
          </AnimateOnScroll>
          {/* Mosaic: large left + 2x2 right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Large image */}
            <div className="relative aspect-[4/3] lg:row-span-2 bg-gray-200 overflow-hidden">
              <Image
                src={project.mainImage}
                alt={t('gallery.mainAlt', { name: projectName })}
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
                  alt={t('gallery.galleryAlt', { name: projectName, index: i + 1 })}
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
                <SectionLabel>{t('floorPlans.label')}</SectionLabel>
                <h2 className="text-[32px] font-light mt-5">
                  {t('floorPlans.heading')}
                </h2>
              </div>
            </AnimateOnScroll>
            <div className="flex flex-col lg:flex-row items-start gap-12">
              {/* Room breakdown */}
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-base font-medium text-black leading-[26px]">
                    {t('floorPlans.bedroomsAndSuites')}
                  </p>
                  <p className="text-[#5f6368] text-base tracking-[0.16px] leading-[28px]">
                    {t('floorPlans.bedroomsBathrooms', { bedrooms: project.bedrooms, bathrooms: project.bathrooms })}
                  </p>
                </div>
                <div>
                  <p className="text-base font-medium text-black leading-[26px]">
                    {t('floorPlans.totalArea')}
                  </p>
                  <p className="text-[#5f6368] text-base tracking-[0.16px] leading-[28px]">
                    {formatArea(project.area, locale)} {project.areaUnit}
                  </p>
                </div>
                <div>
                  <p className="text-base font-medium text-black leading-[26px]">
                    {t('floorPlans.developer')}
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
                <SectionLabel light>{t('amenities.label')}</SectionLabel>
                <h2 className="text-[32px] font-light text-white mt-5">
                  {t('amenities.heading')}
                </h2>
              </div>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 lg:gap-x-24 gap-y-3">
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
              <SectionLabel light>{t('location.label')}</SectionLabel>
              <h2 className="text-[32px] font-light text-white mt-5">
                {t('location.heading')}
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
                title={`${projectName} location`}
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
                {tCommon('viewOnGoogleMaps')} <ExternalLink className="w-3.5 h-3.5 icon-directional" />
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
              <SectionLabel>{t('enquiry.label')}</SectionLabel>
              <h2 className="text-[32px] font-light mt-5">
                {t('enquiry.heading')}
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
            projectName={projectName}
            submitLabel={t('enquiry.submitLabel')}
          />
        </div>
      </section>
    </>
  );
}
