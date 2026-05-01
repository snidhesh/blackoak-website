'use client';

import { useTranslations } from 'next-intl';
import InternationalPropertyCard from './InternationalPropertyCard';
import type { InternationalProperty } from '@/types/international-property';

interface InternationalPropertyGridProps {
  properties: InternationalProperty[];
  columns?: 2 | 3;
}

export default function InternationalPropertyGrid({ properties, columns = 3 }: InternationalPropertyGridProps) {
  const t = useTranslations('common');

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('noPropertiesFound')}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${columns === 3 ? 'lg:grid-cols-3' : ''} gap-8`}>
      {properties.map((property) => (
        <InternationalPropertyCard
          key={property.slug}
          slug={property.slug}
          name={property.name}
          mainImage={property.mainImage}
          localPrice={property.localPrice}
          localCurrency={property.localCurrency}
          city={property.city}
          country={property.country}
          propertyType={property.propertyType}
          bedrooms={property.bedrooms}
          area={property.area}
          areaUnit={property.areaUnit}
          offering={property.offering}
        />
      ))}
    </div>
  );
}
