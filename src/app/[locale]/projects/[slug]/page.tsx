import { notFound, permanentRedirect } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MapPin, Bed, Maximize, Check, ArrowRight } from 'lucide-react';
import { resolveProjectSlug, getSimilarProjects, toProjectListItem } from '@/lib/content';
import { formatArea } from '@/lib/formatters';
import { truncateForMeta } from '@/lib/utils';
import { getProjectName, getProjectDescription } from '@/lib/crm-transform';
import { propertyTypeLabel, isStudio, areaUnitLabel } from '@/lib/listing-labels';
import type { Locale } from '@/i18n/config';
import FormattedPrice from '@/components/ui/FormattedPrice';
import SectionLabel from '@/components/ui/SectionLabel';
import ListingContactCard from '@/components/sections/ListingContactCard';
import { toE164 } from '@/lib/crm-lead';
import { COMPANY } from '@/lib/constants';
import PropertyGrid from '@/components/sections/PropertyGrid';
import { Link } from '@/i18n/navigation';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import StickyNav from '@/components/ui/StickyNav';
import ExpandableText from '@/components/ui/ExpandableText';

// Listing pages are rendered on first request and cached for five minutes
// (the same window as the listings index), so a visit or a crawler hit is
// served from the cache instead of rebuilding the page from the snapshot.
export const revalidate = 300;

interface Props {
  params: { slug: string; locale: string };
}

export async function generateStaticParams() {
  return [];
}

/** Site path of a listing in a locale (English has no prefix). */
function listingPath(slug: string, locale: string): string {
  return locale === 'en' ? `/projects/${slug}/` : `/${locale}/projects/${slug}/`;
}

/**
 * Loads the listing for the requested slug. An old URL for a listing that
 * still exists (edited title, or a pre-id slug) is redirected permanently to
 * its current URL; an unknown slug is a 404.
 */
async function loadListing(params: Props['params']) {
  const resolved = await resolveProjectSlug(params.slug);
  if (!resolved) notFound();
  if (!resolved.isCanonical) permanentRedirect(listingPath(resolved.project.slug, params.locale));
  return resolved.project;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await loadListing(params);
  const locale = params.locale as Locale;
  const tMeta = await getTranslations({ locale, namespace: 'metadata.projectDetail' });
  const tTypes = await getTranslations({ locale, namespace: 'forms.propertyTypes' });
  const tCommonMeta = await getTranslations({ locale, namespace: 'common' });

  const name = getProjectName(project, locale);
  const desc = getProjectDescription(project, locale);
  const offeringLabel = project.offering === 'sale' ? tMeta('forSale') : project.offering === 'rent' || project.offering === 'yearly' ? tMeta('forRent') : '';
  // Title: "<beds> Bedroom <type> for Sale in <building>, <community>" — the
  // listing name itself is broker shorthand ("3BR|Pool|Best Layout") and the
  // CRM address repeats it, which used to produce 180+ character titles.
  const locationLabel = [project.locationBuilding, project.locationCommunity || project.neighbourhood || 'Dubai']
    .filter(Boolean)
    .join(', ');
  const titleVars = { bedrooms: project.bedrooms, type: propertyTypeLabel(project.propertyType, tTypes), offering: offeringLabel, location: locationLabel };
  const title = (
    project.bedrooms > 0
      ? tMeta('titlePattern', titleVars)
      : isStudio(project)
        ? tMeta('titlePatternStudio', titleVars)
        : tMeta('titlePatternNoBedrooms', titleVars)
  )
    .replace(/\s{2,}/g, ' ')
    .trim();
  const area = `${formatArea(project.area, locale)} ${areaUnitLabel(project.areaUnit, tCommonMeta)}`.replace(/\.$/, '');
  const description = truncateForMeta(`${title}, Dubai. ${area}. ${desc}`, 155);

  return {
    title,
    description,
    keywords: [
      `${project.propertyType} ${offeringLabel} Dubai`.trim(),
      `${project.propertyType} ${project.location.address}`,
      `${project.bedrooms} bedroom ${project.propertyType} Dubai`,
      `luxury ${project.propertyType} Dubai`,
      `buy ${project.propertyType} ${project.neighbourhood || 'Dubai'}`,
      `Dubai ${project.propertyType} investment`,
      project.developer ? `${project.developer} Dubai` : '',
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_AE' : 'en_AE',
      url: locale === 'en' ? `https://www.blackoak-re.com/projects/${project.slug}/` : `https://www.blackoak-re.com/${locale}/projects/${project.slug}/`,
      images: [{ url: project.mainImage, width: 1200, height: 630, alt: name }],
    },
    alternates: {
      canonical: locale === 'en' ? `https://www.blackoak-re.com/projects/${project.slug}/` : `https://www.blackoak-re.com/${locale}/projects/${project.slug}/`,
      languages: {
        'x-default': `https://www.blackoak-re.com/projects/${project.slug}/`,
        en: `https://www.blackoak-re.com/projects/${project.slug}/`,
        fr: `https://www.blackoak-re.com/fr/projects/${project.slug}/`,
        ar: `https://www.blackoak-re.com/ar/projects/${project.slug}/`,
      },
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  // Lets next-intl render this page statically instead of reading the locale
  // from the request on every visit.
  setRequestLocale(params.locale);
  const project = await loadListing(params);

  const locale = params.locale as Locale;
  const t = await getTranslations({ locale, namespace: 'pages.projectDetail' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const projectName = getProjectName(project, locale);
  const projectDescription = getProjectDescription(project, locale);

  const hasCoordinates = project.location.lat !== 0 && project.location.lng !== 0;
  const similarProjects = (await getSimilarProjects(project, 3)).map(toProjectListItem);

  // WhatsApp goes to the listing agent's own WhatsApp number when the CRM has
  // one, otherwise to the company line. The message names the listing so the
  // person answering knows what the enquiry is about.
  const agentWhatsapp = project.agent?.whatsapp?.trim();
  const whatsappBase = agentWhatsapp
    ? `https://wa.me/${toE164(agentWhatsapp).replace(/\D/g, '')}`
    : COMPANY.whatsapp;
  const whatsappMessage = [
    tCommon('whatsappInterestMessage', { propertyName: projectName }),
    project.reference ? `(${t('details.reference')}: ${project.reference})` : '',
  ]
    .filter(Boolean)
    .join(' ');
  const whatsappUrl = `${whatsappBase}?text=${encodeURIComponent(whatsappMessage)}`;
  const hasFloorPlans = project.floorPlans.length > 0;

  const stickyNavSections = [
    { id: 'details', label: t('stickyNav.details') },
    { id: 'gallery', label: t('stickyNav.gallery') },
    ...(hasFloorPlans ? [{ id: 'floor-plans', label: t('stickyNav.floorPlans') }] : []),
    { id: 'amenities', label: t('stickyNav.amenities') },
  ];

  const allImages = [project.mainImage, ...project.gallery];

  const availability =
    project.status === 'sold' ? 'https://schema.org/SoldOut' :
    project.status === 'coming-soon' ? 'https://schema.org/PreOrder' :
    'https://schema.org/InStock';

  const listingJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['RealEstateListing', 'Product'],
    name: projectName,
    description: projectDescription,
    url: locale === 'en' ? `https://www.blackoak-re.com/projects/${project.slug}/` : `https://www.blackoak-re.com/${locale}/projects/${project.slug}/`,
    inLanguage: locale,
    image: allImages,
    datePosted: project.availableFrom || new Date().toISOString().split('T')[0],
    ...(project.developer && {
      brand: {
        '@type': 'Organization',
        name: project.developer,
      },
    }),
    offers: {
      '@type': 'Offer',
      price: String(project.price),
      priceCurrency: 'AED',
      availability,
      url: locale === 'en' ? `https://www.blackoak-re.com/projects/${project.slug}/` : `https://www.blackoak-re.com/${locale}/projects/${project.slug}/`,
      seller: {
        '@type': 'RealEstateAgent',
        name: 'BlackOak Real Estate',
        url: 'https://www.blackoak-re.com',
      },
    },
    ...(project.propertyType && { additionalType: `https://schema.org/${project.propertyType.replace(/\s+/g, '')}` }),
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
      { '@type': 'ListItem', position: 1, name: t('breadcrumbs.home'), item: locale === 'en' ? 'https://www.blackoak-re.com' : `https://www.blackoak-re.com/${locale}` },
      { '@type': 'ListItem', position: 2, name: t('breadcrumbs.projects'), item: `https://www.blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/projects/` },
      { '@type': 'ListItem', position: 3, name: projectName, item: `https://www.blackoak-re.com${locale === 'en' ? '' : `/${locale}`}/projects/${project.slug}/` },
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
                  {isStudio(project) ? tCommon('studio') : `${project.bedrooms} ${tCommon('bed')}`}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/60" />
                <span className="flex items-center gap-1.5">
                  <Maximize className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  {formatArea(project.area, locale)} {areaUnitLabel(project.areaUnit, tCommon)}
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
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Section Nav */}
      <StickyNav sections={stickyNavSections} />

      {/* Details, with the contact card pinned beside the description on desktop */}
      <section id="details" className="py-16">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center mb-10">
              <SectionLabel>{t('details.label')}</SectionLabel>
              <h2 className="text-[32px] font-light mt-5">
                {t('details.heading')}
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-8">
              <AnimateOnScroll>
                <ExpandableText
                  text={projectDescription}
                  showMoreLabel={t('details.showMore')}
                  showLessLabel={t('details.showLess')}
                  className="text-[#5f6368] text-base leading-[28px] tracking-[0.16px] whitespace-pre-line"
                />

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

            {/* Contact card. The top offset clears the navbar and the section nav, both sticky. */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-[184px] lg:max-h-[calc(100vh-208px)] lg:overflow-y-auto">
                <ListingContactCard
                  projectSlug={project.slug}
                  projectName={projectName}
                  reference={project.reference}
                  agent={project.agent}
                  whatsappUrl={whatsappUrl}
                />
              </div>
            </aside>
          </div>
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
          {/* Hero on top + 2×2 (or 1×N) thumbnail grid below — adapts to any gallery size with no empty cells. */}
          <div className="space-y-2">
            {/* Hero (mainImage, full width) */}
            <div className="relative aspect-[16/9] bg-gray-200 overflow-hidden group">
              <Image
                src={project.mainImage}
                alt={t('gallery.mainAlt', { name: projectName })}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 80vw"
                priority
              />
            </div>
            {/* Thumbnail grid: exactly fills 2 cols at any responsive width, dropping to 1 odd thumb on mobile only. */}
            {project.gallery.length > 0 && (() => {
              // Cap at 4 thumbs, and round down to even so the grid never leaves a hole.
              const cap = Math.min(project.gallery.length, 4);
              const thumbCount = cap - (cap % 2);
              const thumbs = thumbCount > 0
                ? project.gallery.slice(0, thumbCount)
                : project.gallery.slice(0, 1); // <2 thumbs available — show what we have
              return (
                <div className="grid grid-cols-2 gap-2">
                  {thumbs.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-[4/3] bg-gray-200 overflow-hidden group"
                    >
                      <Image
                        src={img}
                        alt={t('gallery.galleryAlt', { name: projectName, index: i + 1 })}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 50vw, 40vw"
                      />
                    </div>
                  ))}
                </div>
              );
            })()}
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
                    {formatArea(project.area, locale)} {areaUnitLabel(project.areaUnit, tCommon)}
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

      {/* Similar properties */}
      {similarProjects.length > 0 && (
        <section id="similar" className="py-20">
          <div className="container-wide">
            <AnimateOnScroll>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                <div>
                  <SectionLabel className="justify-start">{t('similar.label')}</SectionLabel>
                  <h2 className="text-[32px] font-light mt-5">{t('similar.heading')}</h2>
                  <p className="text-sm text-[#5f6368] mt-3 max-w-xl">{t('similar.description')}</p>
                </div>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[2px] text-black border-b border-black/30 hover:border-black pb-1 w-fit transition-colors"
                >
                  {t('similar.viewAll')}
                  <ArrowRight className="w-3.5 h-3.5 icon-directional" />
                </Link>
              </div>
            </AnimateOnScroll>
            <PropertyGrid projects={similarProjects} />
          </div>
        </section>
      )}

      {/* The Market Briefing: a short invitation; the sign-up itself lives in the Intelligence Hub */}
      <section className="py-16 md:py-20 bg-[#f0f3f8]">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <SectionLabel className="justify-start">{t('briefing.label')}</SectionLabel>
              <h2 className="text-[28px] md:text-[32px] font-light leading-tight mt-5">{t('briefing.heading')}</h2>
              <p className="text-base text-[#5f6368] leading-[28px] mt-3">{t('briefing.description')}</p>
            </div>
            <Link
              href="/insights/intelligence"
              className="inline-flex items-center justify-center gap-2 shrink-0 min-h-[50px] px-8 py-3 bg-black border-2 border-black text-white text-center text-xs font-medium uppercase tracking-[2px] hover:bg-transparent hover:text-black transition-colors"
            >
              {t('briefing.button')}
              <ArrowRight className="w-3.5 h-3.5 icon-directional" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
