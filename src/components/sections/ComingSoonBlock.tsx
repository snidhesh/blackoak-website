import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/config';

export interface ComingSoonEntry {
  name: string;
  image: string;
}

interface Props {
  entries: ComingSoonEntry[];
  locale: Locale;
}

export default async function ComingSoonBlock({ entries, locale }: Props) {
  const tIntl = await getTranslations({ locale, namespace: 'pages.internationalProperties' });

  if (entries.length === 0) return null;

  return (
    <section className="bg-[#0e0e0e] py-20 md:py-28">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT — Editorial title block */}
          <div className="lg:col-span-5 max-w-xl">
            <p className="text-white text-[22px] md:text-[26px] lg:text-[30px] font-light leading-[1.4]">
              {tIntl('comingSoonDescription')}
            </p>
            <div className="mt-8 h-px w-16 bg-white/40" />
          </div>

          {/* RIGHT — Editorial postcard row */}
          <div className="lg:col-span-7">
            {/* Shared "ARRIVING SOON" eyebrow with hairline accents */}
            <div className="flex items-center justify-center gap-4 mb-8 md:mb-10">
              <span className="h-px w-10 md:w-16 bg-white/30" />
              <span className="text-white/70 text-[11px] md:text-[12px] font-medium tracking-[4px] uppercase">
                {tIntl('comingSoon')}
              </span>
              <span className="h-px w-10 md:w-16 bg-white/30" />
            </div>

            {/* 3 larger postcards in a row — sharp, with subtle desaturation that lifts on hover */}
            <div className="grid grid-cols-3 gap-3 md:gap-5">
              {entries.slice(0, 3).map((entry) => (
                <div
                  key={entry.name}
                  className="group relative aspect-[4/5] overflow-hidden"
                >
                  <Image
                    src={entry.image}
                    alt={entry.name}
                    fill
                    className="object-cover saturate-[0.55] brightness-90 transition-all duration-[1100ms] ease-out group-hover:saturate-100 group-hover:brightness-100 group-hover:scale-105"
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 23vw"
                  />
                  {/* Bottom gradient for legibility */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/55 to-transparent" />

                  {/* Destination name */}
                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 text-center">
                    <h4 className="text-white text-[18px] md:text-[22px] lg:text-[24px] font-light leading-tight tracking-wide">
                      {entry.name}
                    </h4>
                    <div className="mt-3 h-px w-8 mx-auto bg-white/50 transition-all duration-700 group-hover:w-14 group-hover:bg-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
