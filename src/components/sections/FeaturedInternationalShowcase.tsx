import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Bed, Maximize, Check, ArrowRight } from 'lucide-react';
import { formatArea } from '@/lib/formatters';
import type { Locale } from '@/i18n/config';
import type { InternationalProperty } from '@/types/international-property';

interface Props {
  property: InternationalProperty;
  locale: Locale;
  variant?: 'dark' | 'light';
}

function formatLocalPrice(price: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : locale === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString()}`;
  }
}

export default async function FeaturedInternationalShowcase({ property, locale, variant = 'dark' }: Props) {
  const t = await getTranslations({ locale, namespace: 'common' });
  const tDetail = await getTranslations({ locale, namespace: 'pages.internationalPropertyDetail' });

  const isDark = variant === 'dark';
  const hasPriceRange = typeof property.priceTo === 'number' && property.priceTo !== property.price;
  const hasBedroomsRange = typeof property.bedroomsTo === 'number' && property.bedroomsTo !== property.bedrooms;
  const hasAreaRange = typeof property.areaTo === 'number' && property.areaTo !== property.area;

  const bedroomsDisplay = hasBedroomsRange
    ? `${property.bedrooms}–${property.bedroomsTo}`
    : `${property.bedrooms}`;
  const areaDisplay = hasAreaRange
    ? `${formatArea(property.area, locale)}–${formatArea(property.areaTo!, locale)}`
    : `${formatArea(property.area, locale)}`;
  const priceLabel = formatLocalPrice(property.localPrice, property.localCurrency, locale);
  const priceDisplay = hasPriceRange ? t('priceFrom', { amount: priceLabel }) : priceLabel;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'} overflow-hidden`}>
      {/* Image side */}
      <Link
        href={`/international-properties/${property.slug}`}
        className="relative lg:col-span-7 aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[640px] overflow-hidden group block"
      >
        <Image
          src={property.mainImage}
          alt={property.name}
          fill
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 1024px) 100vw, 58vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />

        {/* Top-left tags */}
        <div className="absolute top-5 start-5 flex flex-col items-start gap-2">
          <span className="bg-white/95 backdrop-blur-sm text-black text-[10px] font-medium tracking-[2px] uppercase px-3 py-1.5">
            {property.propertyType}
          </span>
          <span className="bg-black text-white text-[10px] font-medium tracking-[2px] uppercase px-3 py-1.5">
            {tDetail('availableResidences.label')}
          </span>
        </div>

        {/* Bottom-right country chip */}
        <div className="absolute bottom-5 end-5">
          <span className="bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium tracking-[2px] uppercase px-3 py-1.5">
            {property.country}
          </span>
        </div>
      </Link>

      {/* Content side */}
      <div className={`lg:col-span-5 p-8 sm:p-10 lg:p-14 flex flex-col justify-center ${isDark ? 'text-white' : 'text-black'}`}>
        <p className={`text-[11px] tracking-[3px] uppercase mb-3 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
          {property.city}, {property.country}
        </p>

        <h3 className="text-[28px] sm:text-[32px] lg:text-[40px] font-light leading-[1.15] mb-4">
          {property.name}
        </h3>

        <p className={`text-sm leading-relaxed mb-7 line-clamp-3 ${isDark ? 'text-white/70' : 'text-black/65'}`}>
          {property.description}
        </p>

        {/* Price block */}
        <div className={`border-t pt-6 mb-6 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <p className={`text-[10px] tracking-[3px] uppercase mb-1.5 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
            {t('priceStartingFrom')}
          </p>
          <p className="text-[26px] sm:text-[30px] font-semibold leading-none">{priceDisplay}</p>
        </div>

        {/* Specs row */}
        <div className={`flex flex-wrap gap-x-6 gap-y-2 text-sm mb-7 ${isDark ? 'text-white/80' : 'text-black/75'}`}>
          <span className="inline-flex items-center gap-2">
            <Bed className="w-4 h-4 shrink-0" />
            {bedroomsDisplay} {t('bedrooms')}
          </span>
          <span className="inline-flex items-center gap-2">
            <Maximize className="w-4 h-4 shrink-0" />
            {areaDisplay} {property.areaUnit}
          </span>
        </div>

        {/* Amenities preview */}
        {property.amenities.length > 0 && (
          <ul className={`grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[13px] mb-8 ${isDark ? 'text-white/75' : 'text-black/70'}`}>
            {property.amenities.slice(0, 4).map((amenity) => (
              <li key={amenity} className="inline-flex items-center gap-2">
                <Check className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-white/60' : 'text-black/50'}`} />
                <span className="truncate">{amenity}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Subtle text link, not a button */}
        <Link
          href={`/international-properties/${property.slug}`}
          className={`inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[2px] pb-1 border-b w-fit transition-colors ${
            isDark
              ? 'text-white border-white/30 hover:border-white'
              : 'text-black border-black/30 hover:border-black'
          }`}
        >
          {tDetail('availableResidences.heading')}
          <ArrowRight className="w-3.5 h-3.5 icon-directional" />
        </Link>
      </div>
    </div>
  );
}
