import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { MapPin, Bed, Maximize, Bath, Check, ExternalLink } from 'lucide-react';
import { formatArea } from '@/lib/formatters';
import type { Locale } from '@/i18n/config';
import type { InternationalProperty, InternationalCountry } from '@/types/international-property';
import SectionLabel from '@/components/ui/SectionLabel';
import ContactForm from '@/components/sections/ContactForm';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import StickyNav from '@/components/ui/StickyNav';

interface Props {
  property: InternationalProperty;
  country: InternationalCountry | undefined;
  locale: Locale;
  slug: string;
}

function formatLocalPrice(price: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

export default async function InternationalPropertyDetailPage({ property, country, locale, slug }: Props) {
  const t = await getTranslations({ locale, namespace: 'pages.internationalPropertyDetail' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const hasCoordinates = property.coordinates.lat !== 0 && property.coordinates.lng !== 0;
  const hasAmenities = property.amenities.length > 0;

  const stickyNavSections = [
    { id: 'details', label: t('stickyNav.details') },
    { id: 'gallery', label: t('stickyNav.gallery') },
    ...(hasAmenities ? [{ id: 'amenities', label: t('stickyNav.amenities') }] : []),
    { id: 'location', label: t('stickyNav.location') },
    { id: 'enquiry', label: t('stickyNav.enquiry') },
  ];

  const allImages = [property.mainImage, ...property.gallery];

  const localePath = (path: string, loc: string) =>
    loc === 'en' ? `https://blackoak-re.com${path}` : `https://blackoak-re.com/${loc}${path}`;

  const listingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.name,
    description: property.description,
    url: localePath(`/international-properties/${slug}/`, locale),
    inLanguage: locale,
    image: allImages,
    offers: {
      '@type': 'Offer',
      price: property.localPrice,
      priceCurrency: property.localCurrency,
      availability: 'https://schema.org/InStock',
    },
    numberOfRooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitText: property.areaUnit,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.city,
      addressCountry: property.countryCode,
    },
    ...(hasCoordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: property.coordinates.lat,
        longitude: property.coordinates.lng,
      },
    }),
    ...(hasAmenities && {
      amenityFeature: property.amenities.map((a) => ({
        '@type': 'LocationFeatureSpecification',
        name: a,
      })),
    }),
  };

  const breadcrumbItems = [
    { '@type': 'ListItem' as const, position: 1, name: t('breadcrumbs.home'), item: localePath('/', locale) },
    { '@type': 'ListItem' as const, position: 2, name: t('breadcrumbs.internationalProperties'), item: localePath('/international-properties/', locale) },
  ];

  if (country) {
    breadcrumbItems.push({
      '@type': 'ListItem' as const,
      position: 3,
      name: country.name,
      item: localePath(`/international-properties/${country.slug}/`, locale),
    });
    breadcrumbItems.push({
      '@type': 'ListItem' as const,
      position: 4,
      name: property.name,
      item: localePath(`/international-properties/${slug}/`, locale),
    });
  } else {
    breadcrumbItems.push({
      '@type': 'ListItem' as const,
      position: 3,
      name: property.name,
      item: localePath(`/international-properties/${slug}/`, locale),
    });
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
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
          src={property.mainImage}
          alt={property.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-x-0 top-0 h-[188px] bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="relative z-10 container-wide pb-8 md:pb-12 w-full">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-[24px] md:text-[36px] lg:text-[42px] font-light leading-[1.2] text-white">
                {property.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-2 md:mt-3 text-white/90">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                <span className="text-[13px] md:text-base">{property.city}, {property.country}</span>
              </div>
              <div className="flex items-center gap-2.5 mt-2 md:mt-3 text-white/90 text-[13px] md:text-base font-medium">
                <span className="flex items-center gap-1.5">
                  <Bed className="w-4 h-4 md:w-5 md:h-5" />
                  {property.bedrooms} {tCommon('bed')}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/60" />
                <span className="flex items-center gap-1.5">
                  <Bath className="w-4 h-4 md:w-5 md:h-5" />
                  {property.bathrooms} {tCommon('bathrooms')}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/60" />
                <span className="flex items-center gap-1.5">
                  <Maximize className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                  {formatArea(property.area, locale)} {property.areaUnit}
                </span>
              </div>
            </div>

            <div className="md:text-end shrink-0">
              <p className="text-[11px] md:text-[13px] text-white/70 uppercase tracking-wider">
                {tCommon('priceStartingFrom')}
              </p>
              <div className="flex items-center md:justify-end gap-2 mt-1">
                <span className="text-[22px] md:text-[28px] font-semibold text-white">
                  {formatLocalPrice(property.localPrice, property.localCurrency, locale)}
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
              {property.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-black">{tCommon('bedrooms')}</p>
                <p className="text-sm text-[#5f6368] mt-1">{property.bedrooms}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-black">{tCommon('bathrooms')}</p>
                <p className="text-sm text-[#5f6368] mt-1">{property.bathrooms}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-black">{tCommon('sqFt')}</p>
                <p className="text-sm text-[#5f6368] mt-1">{formatArea(property.area, locale)} {property.areaUnit}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-black">{property.propertyType}</p>
                <p className="text-sm text-[#5f6368] mt-1">{property.developer}</p>
              </div>
            </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="relative aspect-[4/3] lg:row-span-2 bg-gray-200 overflow-hidden">
              <Image
                src={property.mainImage}
                alt={t('gallery.mainAlt', { name: property.name })}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {property.gallery.slice(0, 4).map((img, i) => (
              <div key={i} className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                <Image
                  src={img}
                  alt={t('gallery.galleryAlt', { name: property.name, index: i + 1 })}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities - Black Background */}
      {hasAmenities && (
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
              {property.amenities.map((amenity) => (
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
                src={`https://www.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}&z=15&output=embed`}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${property.name} location`}
              />
            </div>
          ) : (
            <div className="bg-gray-900 rounded p-8 text-center">
              <MapPin className="w-8 h-8 text-white/60 mx-auto mb-4" />
              <p className="text-white text-lg mb-2">{property.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}`}
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
          <ContactForm
            endpoint="/api/project-enquiry"
            projectSlug={property.slug}
            projectName={property.name}
            submitLabel={t('enquiry.submitLabel')}
          />
        </div>
      </section>
    </>
  );
}
