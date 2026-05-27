import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowUpRight, MapPin, BedDouble, Maximize2 } from 'lucide-react';
import { getFeaturedProjects } from '@/lib/content';
import FormattedPrice from '@/components/ui/FormattedPrice';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import type { Locale } from '@/i18n/config';

export function FeaturedProjectsSkeleton() {
  return (
    <>
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-[260px] md:h-[332px] bg-gray-100 animate-pulse rounded-sm ${i === 0 ? 'lg:col-span-2' : ''}`}
          />
        ))}
      </div>
      <div className="md:hidden flex gap-5 overflow-hidden ps-5 pe-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[85vw]">
            <div className="h-[276px] bg-gray-100 animate-pulse" />
            <div className="pt-4 space-y-2">
              <div className="h-5 w-3/4 bg-gray-100 animate-pulse rounded-sm" />
              <div className="h-4 w-1/2 bg-gray-100 animate-pulse rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default async function FeaturedProjectsGrid({ locale }: { locale: Locale }) {
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const featuredProjects = (await getFeaturedProjects()).slice(0, 5);

  return (
    <>
      {/* Desktop grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {featuredProjects.map((project, i) => (
          <AnimateOnScroll
            key={project.slug}
            delay={i * 0.08}
            className={i === 0 ? 'lg:col-span-2' : ''}
          >
            <Link
              href={`/projects/${project.slug}`}
              className="group relative block overflow-hidden"
            >
              <div className="relative h-[260px] md:h-[332px]">
                <Image
                  src={project.mainImage}
                  alt={project.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes={i === 0 ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-300" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="inline-block bg-black/60 text-white text-[10px] font-medium tracking-[0.2px] uppercase leading-[15px] px-3 py-1 rounded-sm mb-3">
                    {project.propertyType}
                  </span>
                  <p className="text-white font-semibold text-[28px] leading-[20px] flex items-center gap-2">
                    <FormattedPrice price={project.price} size="lg" light />
                  </p>
                  <p className="text-white/80 font-light text-[16px] leading-[40px]">{project.name}</p>

                  <div className="flex items-center gap-4 text-white/80 text-[12px] font-normal max-h-0 overflow-hidden opacity-0 group-hover:max-h-[40px] group-hover:opacity-100 transition-all duration-300 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {project.neighbourhood.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-3 h-3" />
                      {project.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      {project.area.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </AnimateOnScroll>
        ))}
      </div>

      {/* Mobile horizontal scroll */}
      <div className="md:hidden relative">
        <div className="absolute left-0 top-[156px] w-[10px] h-[67px] bg-black rounded-r z-10" />
        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide ps-5 pe-5">
          {featuredProjects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group flex-shrink-0 w-[85vw] snap-start"
            >
              <div className="relative h-[276px] overflow-hidden">
                <Image
                  src={project.mainImage}
                  alt={project.name}
                  fill
                  className="object-cover"
                  sizes="85vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="inline-block bg-black/60 text-white text-[10px] font-medium tracking-[0.2px] uppercase leading-[15px] px-3 py-1 rounded-sm mb-3">
                    {project.propertyType}
                  </span>
                  <p className="text-white font-semibold text-[24px] leading-[28px] flex items-center gap-2">
                    <FormattedPrice price={project.price} size="md" light />
                  </p>
                </div>
                <div className="absolute bottom-4 right-4">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="pt-4">
                <h3 className="font-semibold text-[18px] leading-[24px] text-gray-900 line-clamp-2">
                  {project.name}
                </h3>
                <div className="mt-2 space-y-1 text-[13px] text-[#5F6368]">
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {project.location.address}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5" />
                      {project.bedrooms} {tCommon('bedrooms')}
                    </span>
                    <span className="text-[#5F6368]">•</span>
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5" />
                      {project.area.toLocaleString('en-US')} {project.areaUnit}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
