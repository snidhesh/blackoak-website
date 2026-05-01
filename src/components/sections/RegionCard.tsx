'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';

interface RegionCardProps {
  slug: string;
  name: string;
  description: string;
  image: string;
  propertyCount: number;
  propertyLabel: string;
}

export default function RegionCard({
  slug,
  name,
  description,
  image,
  propertyCount,
  propertyLabel,
}: RegionCardProps) {
  return (
    <Link
      href={`/international-properties?region=${slug}`}
      className="group relative block aspect-[3/4] overflow-hidden"
    >
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium tracking-wider uppercase px-3 py-1 rounded-sm mb-3">
          {propertyCount} {propertyLabel}
        </span>
        <h3 className="text-white text-[24px] md:text-[28px] font-light leading-[1.2]">
          {name}
        </h3>
        <p className="text-white/70 text-sm mt-2 line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
}
