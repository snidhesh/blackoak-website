'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { Bed, Maximize, ChevronDown, MessageCircle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { formatArea } from '@/lib/formatters';
import type { Locale } from '@/i18n/config';
import type { InternationalProperty, UnitType } from '@/types/international-property';
import FloorPlanModal from '@/components/ui/FloorPlanModal';

interface Props {
  property: InternationalProperty;
  whatsappBaseUrl: string; // e.g. "https://wa.me/971501046890"
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

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/** Lightweight auto-advancing image slider — no external deps. */
function ImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      {images.map((src, i) => (
        <Image
          key={src + i}
          src={src}
          alt={`${alt} ${i + 1}`}
          fill
          priority={i === 0}
          className={`object-cover transition-opacity duration-[800ms] ease-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width: 1024px) 100vw, 70vw"
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />

      {/* Pagination dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 inset-x-0 z-10 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AvailableResidencesAccordion({ property, whatsappBaseUrl }: Props) {
  const t = useTranslations('pages.internationalPropertyDetail.availableResidences');
  const tCommon = useTranslations('common');
  const locale = useLocale() as Locale;

  const units = property.unitTypes ?? [];
  if (units.length === 0) return null;

  const grouped: Record<string, UnitType[]> = {};
  for (const u of units) {
    const key = u.category ?? 'all';
    (grouped[key] ||= []).push(u);
  }

  const renderUnitPrice = (unit: UnitType) => {
    if (unit.priceOnRequest || unit.price == null) return tCommon('priceOnRequest');
    return formatLocalPrice(unit.localPrice ?? unit.price, property.localCurrency, locale);
  };

  const whatsappLink = (unitName: string) => {
    const message = tCommon('whatsappResidenceMessage', { unitName, propertyName: property.name });
    return `${whatsappBaseUrl}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {Object.entries(grouped).map(([category, groupUnits]) => {
        const categoryLabel = category !== 'all'
          ? t(`categories.${category}` as 'categories.beach')
          : property.name;
        const sliderImages = uniq(groupUnits.map((u) => u.image).filter((x): x is string => !!x));

        return (
          <Disclosure key={category} as="div" className="border border-gray-200 rounded-md overflow-hidden bg-white">
            {({ open }) => (
              <>
                {/* Image slider header */}
                {sliderImages.length > 0 && (
                  <div className="relative aspect-[16/8] md:aspect-[16/7] bg-gray-200">
                    <ImageSlider images={sliderImages} alt={categoryLabel} />

                    {/* Floating category label */}
                    <div className="absolute top-5 start-5 z-10 pointer-events-none">
                      <p className="text-white/80 text-[10px] tracking-[3px] uppercase">
                        {t('label')}
                      </p>
                      <h3 className="text-white text-[24px] md:text-[28px] font-light mt-1">
                        {categoryLabel}
                      </h3>
                    </div>
                  </div>
                )}

                {/* Expand / collapse trigger */}
                <DisclosureButton className="w-full flex items-center justify-between gap-4 px-5 md:px-7 py-4 md:py-5 hover:bg-gray-50 transition-colors text-start">
                  <div>
                    <p className="text-[10px] tracking-[2.5px] uppercase text-gray-500">
                      {groupUnits.length} {groupUnits.length === 1 ? tCommon('property') : tCommon('properties')}
                    </p>
                    <p className="text-sm md:text-base font-medium text-black mt-0.5">
                      {open ? t('collapse') : t('expand')}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                  />
                </DisclosureButton>

                <DisclosurePanel className="border-t border-gray-100">
                  <ul className="divide-y divide-gray-100">
                    {groupUnits.map((unit) => (
                      <li
                        key={unit.name}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center px-5 md:px-7 py-5 md:py-6"
                      >
                        <div className="md:col-span-5">
                          <h4 className="text-base md:text-lg font-medium text-black leading-tight">{unit.name}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-[#5f6368]">
                            <span className="inline-flex items-center gap-1.5">
                              <Bed className="w-4 h-4" />
                              {unit.bedrooms} {tCommon('bedrooms')}
                            </span>
                            {unit.area !== null && (
                              <span className="inline-flex items-center gap-1.5">
                                <Maximize className="w-4 h-4" />
                                {formatArea(unit.area, locale)} {unit.areaUnit}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <p className="text-[9px] tracking-[2.5px] uppercase text-gray-500">
                            {unit.priceOnRequest || unit.price == null ? ' ' : tCommon('priceStartingFrom')}
                          </p>
                          <p className="text-[18px] md:text-[20px] font-semibold text-black leading-tight mt-0.5">
                            {renderUnitPrice(unit)}
                          </p>
                        </div>

                        <div className="md:col-span-4 flex items-center gap-2 md:justify-end">
                          {unit.floorPlanImageUrl ? (
                            <FloorPlanModal
                              triggerLabel={t('viewFloorPlan')}
                              closeLabel={tCommon('closeDialog')}
                              title={`${property.name} — ${unit.name}`}
                              imageUrl={unit.floorPlanImageUrl}
                              pdfUrl={unit.floorPlanUrl}
                              alt={`${unit.name} floor plan`}
                            />
                          ) : (
                            <span className="flex-1" />
                          )}
                          <a
                            href={whatsappLink(unit.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 h-[40px] bg-[#25D366] text-white text-xs uppercase tracking-wider hover:bg-[#1ebe57] transition-colors px-3"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {t('enquire')}
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </DisclosurePanel>
              </>
            )}
          </Disclosure>
        );
      })}
    </div>
  );
}
