'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Bed, Maximize } from 'lucide-react';
import { formatArea } from '@/lib/formatters';
import type { Locale } from '@/i18n/config';
import FormattedPrice from '@/components/ui/FormattedPrice';

interface PropertyCardProps {
  slug: string;
  name: string;
  mainImage: string;
  price: number;
  currency: string;
  developer: string;
  neighbourhood: string;
  propertyType?: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  offering?: string;
}

export default function PropertyCard({
  slug,
  name,
  mainImage,
  price,
  neighbourhood,
  propertyType,
  bedrooms,
  area,
  areaUnit,
  offering,
}: PropertyCardProps) {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;

  const locationLabel = neighbourhood
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="group border border-gray-200 rounded-md p-4">
      <Link href={`/projects/${slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[440/322] overflow-hidden rounded-md bg-gray-200">
          <Image
            src={mainImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 start-3 flex items-center gap-1.5">
            {propertyType && (
              <span className="bg-white text-gray-500 text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-sm">
                {propertyType}
              </span>
            )}
            {offering && (
              <span className="bg-black text-white text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-sm">
                {offering === 'sale' ? t('forSale') : offering === 'rent' ? t('forRent') : offering}
              </span>
            )}
          </div>
        </div>

        {/* Price + Name */}
        <div className="mt-4">
          <p className="text-lg font-semibold flex items-center gap-1.5">
            <FormattedPrice price={price} />
          </p>
          <h3 className="text-sm text-gray-900 mt-1 leading-relaxed">{name}</h3>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>Dubai, {locationLabel}</span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Bed className="w-3.5 h-3.5" /> {bedrooms} {t('bedrooms')}
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="w-3.5 h-3.5" /> {formatArea(area, locale)} {areaUnit}
          </span>
        </div>
      </Link>

      {/* CTA */}
      <Link
        href={`/projects/${slug}`}
        className="mt-4 flex items-center justify-center w-full h-11 bg-black text-white text-[11px] font-medium uppercase tracking-wider hover:bg-gray-900 transition-colors"
      >
        {t('viewDetails')}
      </Link>
    </div>
  );
}
