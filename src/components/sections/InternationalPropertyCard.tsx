'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { MapPin, Bed, Maximize, Mail, Phone, MessageCircle } from 'lucide-react';
import { formatArea } from '@/lib/formatters';
import type { Locale } from '@/i18n/config';

interface InternationalPropertyCardProps {
  slug: string;
  name: string;
  mainImage: string;
  localPrice: number;
  localPriceTo?: number;
  localCurrency: string;
  city: string;
  country: string;
  propertyType?: string;
  bedrooms: number;
  bedroomsTo?: number;
  area: number;
  areaTo?: number;
  areaUnit: string;
  offering?: string;
  status?: 'available' | 'sold' | 'coming-soon';
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

export default function InternationalPropertyCard({
  slug,
  name,
  mainImage,
  localPrice,
  localPriceTo,
  localCurrency,
  city,
  country,
  propertyType,
  bedrooms,
  bedroomsTo,
  area,
  areaTo,
  areaUnit,
  offering,
  status = 'available',
}: InternationalPropertyCardProps) {
  const t = useTranslations('common');
  const tIntl = useTranslations('pages.internationalProperties');
  const locale = useLocale() as Locale;

  const isComingSoon = status === 'coming-soon';

  const priceLabel = formatLocalPrice(localPrice, localCurrency, locale);
  const priceDisplay = localPriceTo && localPriceTo !== localPrice
    ? t('priceFrom', { amount: priceLabel })
    : priceLabel;

  const bedroomsDisplay = bedroomsTo && bedroomsTo !== bedrooms
    ? `${bedrooms}–${bedroomsTo}`
    : `${bedrooms}`;

  const areaDisplay = areaTo && areaTo !== area
    ? `${formatArea(area, locale)}–${formatArea(areaTo, locale)}`
    : `${formatArea(area, locale)}`;

  const imageBlock = (
    <div className="relative aspect-[440/322] overflow-hidden rounded-md bg-gray-200">
      <Image
        src={mainImage}
        alt={name}
        fill
        className={`object-cover transition-transform duration-500 ${
          isComingSoon ? 'opacity-70 grayscale' : 'group-hover:scale-105'
        }`}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute top-3 start-3 flex items-center gap-1.5">
        {propertyType && (
          <span className="bg-white text-gray-500 text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-sm">
            {propertyType}
          </span>
        )}
        {offering && !isComingSoon && (
          <span className="bg-black text-white text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-sm">
            {offering === 'sale' ? t('forSale') : offering === 'rent' || offering === 'yearly' ? t('forRent') : offering}
          </span>
        )}
      </div>
      {isComingSoon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-black/80 text-white text-[11px] font-medium tracking-wider uppercase px-3 py-1.5 rounded-sm">
            {tIntl('comingSoon')}
          </span>
        </div>
      )}
    </div>
  );

  const textBlock = (
    <>
      {/* Price + Name */}
      <div className="mt-4">
        <p className="text-lg font-semibold">{priceDisplay}</p>
        <h3 className="text-sm text-gray-900 mt-1 leading-relaxed">{name}</h3>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
        <MapPin className="w-3.5 h-3.5 shrink-0" />
        <span>{city}, {country}</span>
      </div>

      {/* Specs */}
      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Bed className="w-3.5 h-3.5" /> {bedroomsDisplay} {t('bedrooms')}
        </span>
        <span className="flex items-center gap-1">
          <Maximize className="w-3.5 h-3.5" /> {areaDisplay} {areaUnit}
        </span>
      </div>
    </>
  );

  if (isComingSoon) {
    return (
      <div className="group border border-gray-200 rounded-md p-4">
        <div className="block">
          {imageBlock}
          {textBlock}
        </div>
      </div>
    );
  }

  return (
    <div className="group border border-gray-200 rounded-md p-4">
      <Link href={`/international-properties/${slug}`} className="block">
        {imageBlock}
        {textBlock}
      </Link>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-4">
        <a
          href={`mailto:info@blackoak-re.com?subject=Enquiry: ${name}`}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
        >
          <Mail className="w-3.5 h-3.5" /> {t('email')}
        </a>
        <a
          href="tel:+97143989055"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
        >
          <Phone className="w-3.5 h-3.5" /> {t('call')}
        </a>
        <a
          href={`https://wa.me/971501046890?text=${encodeURIComponent(t('whatsappInterestMessage', { propertyName: name }))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 hover:text-black transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" /> {t('whatsapp')}
        </a>
      </div>
    </div>
  );
}
