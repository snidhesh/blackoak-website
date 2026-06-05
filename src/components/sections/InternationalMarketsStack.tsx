'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export interface MarketEntry {
  /** Display name shown in the rotated label and headings (e.g. "Maldives") */
  name: string;
  /** Sub-label, e.g. "United Arab Emirates" or a region */
  country: string;
  /** Short editorial paragraph shown when expanded. Omit for a compact layout. */
  focus?: string;
  /** Background image URL */
  image: string;
  /** When 'active', renders the CTA link; otherwise shows a coming-soon tag */
  status: 'active' | 'coming-soon';
  /** Required when status is 'active' — where the CTA navigates */
  href?: string;
  /** Optional label override for the CTA (default: t('common.viewDetails')) */
  ctaLabel?: string;
}

interface Props {
  entries: MarketEntry[];
  /** Section eyebrow label, e.g. "Key Markets" */
  eyebrow?: string;
  /** Section heading */
  heading?: React.ReactNode;
  /** Show the "Available" / "Coming Soon" status chip in the expanded panel. Default true. */
  showStatus?: boolean;
}

export default function InternationalMarketsStack({ entries, eyebrow, heading, showStatus = true }: Props) {
  const t = useTranslations('common');
  const tIntl = useTranslations('pages.internationalProperties');
  // Default the first ACTIVE entry expanded (so the live listing shows by default).
  const initialIndex = Math.max(0, entries.findIndex((e) => e.status === 'active'));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [mobileOpen, setMobileOpen] = useState<number>(initialIndex);

  if (entries.length === 0) return null;

  return (
    <section className="bg-[#0e0e0e] py-20 md:py-28">
      <div className="container-wide">
        {/* Heading */}
        {(eyebrow || heading) && (
          <div className="mb-12 md:mb-16">
            {eyebrow && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-5"
              >
                <div className="h-px w-6 bg-white" />
                <span className="text-white text-[11px] md:text-xs font-medium tracking-[0.35em] uppercase">
                  {eyebrow}
                </span>
              </motion.div>
            )}
            {heading && (
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-white text-3xl md:text-5xl font-light tracking-wide leading-tight"
              >
                {heading}
              </motion.h2>
            )}
          </div>
        )}

        {/* Desktop — horizontal stack accordion */}
        <div className="hidden md:flex h-[420px] lg:h-[480px] gap-0 overflow-hidden">
          {entries.map((entry, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.div
                key={entry.name}
                onClick={() => setActiveIndex(index)}
                animate={{ flex: isOpen ? 4 : 1 }}
                transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                className="relative overflow-hidden cursor-pointer border-e border-white/15 last:border-e-0"
              >
                <Image
                  src={entry.image}
                  alt={entry.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  priority={index === initialIndex}
                />
                <div className="absolute inset-0 bg-black/45" />

                {/* Collapsed label — rotated city name */}
                <AnimatePresence>
                  {!isOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <span className="text-white text-base lg:text-lg font-light tracking-[0.4em] uppercase -rotate-90 whitespace-nowrap">
                        {entry.name}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expanded content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.15 }}
                      className="absolute inset-0 flex flex-col justify-end p-8 lg:p-10"
                    >
                      <div className="bg-black/65 backdrop-blur-sm p-7 lg:p-8 max-w-md">
                        <div className="flex items-center justify-between gap-4 mb-3">
                          <h3 className="text-2xl lg:text-[28px] font-light text-white leading-tight">
                            {entry.name}
                          </h3>
                          {showStatus && (
                            <span
                              className={`text-[10px] tracking-[2.5px] uppercase ${
                                entry.status === 'active' ? 'text-white' : 'text-white/55'
                              }`}
                            >
                              {entry.status === 'active'
                                ? t('nowAvailable')
                                : tIntl('comingSoon')}
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] tracking-[0.2em] uppercase text-white/60 block ${entry.focus ? 'mb-4' : ''}`}>
                          {entry.country}
                        </span>
                        {entry.focus && (
                          <p className="text-sm text-white/80 leading-relaxed font-light">
                            {entry.focus}
                          </p>
                        )}
                        {entry.href && (
                          <Link
                            href={entry.href}
                            className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-white border-b border-white/40 pb-1 hover:border-white transition-colors w-fit"
                          >
                            {entry.ctaLabel ?? t('viewDetails')}
                            <ArrowRight className="w-3.5 h-3.5 icon-directional" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile — vertical accordion */}
        <div className="flex flex-col gap-0 md:hidden">
          {entries.map((entry, index) => {
            const isOpen = mobileOpen === index;
            return (
              <div key={entry.name} className="border border-white/10 -mt-px first:mt-0 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileOpen(isOpen ? -1 : index)}
                  className="relative w-full h-16 overflow-hidden cursor-pointer"
                >
                  <Image
                    src={entry.image}
                    alt={entry.name}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-black/60" />
                  <div className="relative flex items-center justify-between px-5 h-full">
                    <span className="text-white font-light text-base tracking-wide">{entry.name}</span>
                    {showStatus && (
                      <span className="text-white/60 text-[10px] tracking-[0.2em] uppercase">
                        {entry.status === 'active' ? t('nowAvailable') : tIntl('comingSoon')}
                      </span>
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="overflow-hidden bg-[#161616]"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={entry.image}
                          alt={entry.name}
                          fill
                          className="object-cover"
                          sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                      </div>
                      <div className="p-5">
                        <p className={`text-[11px] tracking-[0.2em] uppercase text-white/60 ${entry.focus ? 'mb-2' : ''}`}>
                          {entry.country}
                        </p>
                        {entry.focus && (
                          <p className="text-sm text-white/75 leading-relaxed font-light">
                            {entry.focus}
                          </p>
                        )}
                        {entry.href && (
                          <Link
                            href={entry.href}
                            className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase text-white border-b border-white/40 pb-1 w-fit"
                          >
                            {entry.ctaLabel ?? t('viewDetails')}
                            <ArrowRight className="w-3.5 h-3.5 icon-directional" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
