'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import SectionLabel from '@/components/ui/SectionLabel';
import SectionHeading from '@/components/ui/SectionHeading';
import AnimateOnScroll from '@/components/shared/AnimateOnScroll';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export interface ServiceLine {
  id: string;
  title: string;
  description: string;
  capabilities: string[];
  cta: { label: string; href: string };
}

interface ServiceLinesProps {
  label: string;
  heading: string;
  items: ServiceLine[];
}

// Desktop places each title in its own row of column one, while every panel
// shares column two. Tailwind needs literal class names, so the rows are listed
// here — add an entry (and a grid row below) if a fifth service line is added.
const ROW_START = ['lg:row-start-1', 'lg:row-start-2', 'lg:row-start-3', 'lg:row-start-4'];

// Short pause before a hover switches the panel, so crossing other titles on
// the way to the panel doesn't change it under the cursor.
const HOVER_INTENT_MS = 120;

export default function ServiceLines({ label, heading, items }: ServiceLinesProps) {
  // Desktop always shows one line in the side panel; mobile is an accordion that
  // starts fully collapsed. Both are tracked and the lg: breakpoint picks which one
  // applies, so the server and client render the same markup at any width.
  const [desktopId, setDesktopId] = useState(items[0]?.id);
  const [mobileId, setMobileId] = useState<string | null>(null);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const handleMouseEnter = (id: string) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setDesktopId(id), HOVER_INTENT_MS);
  };

  const handleMouseLeave = () => clearTimeout(hoverTimer.current);

  const handleClick = (id: string) => {
    setDesktopId(id);
    setMobileId((current) => (current === id ? null : id));
  };

  return (
    <section className="bg-black text-white py-20 lg:py-28">
      <div className="container-wide">
        <AnimateOnScroll>
          <SectionLabel light className="justify-start">{label}</SectionLabel>
          <SectionHeading title={heading} light align="left" className="mt-4 mb-12 lg:mb-16" />
        </AnimateOnScroll>

        <div className="grid border-b border-white/10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:grid-rows-[repeat(4,auto)_1fr]">
          {items.map((item, i) => {
            const isDesktopActive = item.id === desktopId;
            const isMobileOpen = item.id === mobileId;
            const buttonId = `service-line-${item.id}`;
            const panelId = `service-line-panel-${item.id}`;

            return [
              <h3 key={buttonId} className={cn('lg:col-start-1', ROW_START[i])}>
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isDesktop ? isDesktopActive : isMobileOpen}
                  aria-controls={panelId}
                  onClick={() => handleClick(item.id)}
                  onFocus={() => setDesktopId(item.id)}
                  onMouseEnter={() => handleMouseEnter(item.id)}
                  onMouseLeave={handleMouseLeave}
                  className="group relative flex w-full items-center justify-between gap-6 py-6 text-start lg:py-8 lg:pe-12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                >
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/10" />
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-0 top-0 h-px origin-left bg-gold transition-transform duration-500 ease-out motion-reduce:transition-none rtl:origin-right',
                      isMobileOpen ? 'scale-x-100' : 'scale-x-0',
                      isDesktopActive ? 'lg:scale-x-100' : 'lg:scale-x-0'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[28px] font-light leading-[1.15] transition-colors duration-300 md:text-[36px] xl:text-[44px]',
                      isMobileOpen ? 'text-white' : 'text-white/60',
                      isDesktopActive ? 'lg:text-white' : 'lg:text-white/40 lg:group-hover:text-white/70'
                    )}
                  >
                    {item.title}
                  </span>
                  {isMobileOpen ? (
                    <Minus aria-hidden="true" className="h-5 w-5 shrink-0 text-gold lg:hidden" />
                  ) : (
                    <Plus aria-hidden="true" className="h-5 w-5 shrink-0 text-white/40 lg:hidden" />
                  )}
                </button>
              </h3>,

              <div
                key={panelId}
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cn(
                  'pb-10 lg:col-start-2 lg:row-[1/-1] lg:block lg:border-s lg:border-white/10 lg:pb-12 lg:ps-12 lg:pt-8 xl:ps-20',
                  'lg:transition-opacity lg:duration-500 motion-reduce:transition-none',
                  isMobileOpen ? 'block' : 'hidden',
                  isDesktopActive ? 'lg:visible lg:opacity-100' : 'lg:invisible lg:opacity-0'
                )}
              >
                <p className="max-w-[34em] text-[19px] font-light leading-[1.5] text-white md:text-[22px] xl:text-[26px] xl:leading-[1.45]">
                  {item.description}
                </p>
                <ul className="mt-8 grid grid-cols-1 gap-x-10 border-b border-white/10 sm:grid-cols-2">
                  {item.capabilities.map((capability) => (
                    <li
                      key={capability}
                      className="border-t border-white/10 py-3.5 text-[15px] leading-[22px] text-gray-300"
                    >
                      {capability}
                    </li>
                  ))}
                </ul>
                <Button href={item.cta.href} variant="outline-light" className="mt-8">
                  {item.cta.label} <ArrowRight className="ms-2 h-4 w-4 icon-directional" />
                </Button>
              </div>,
            ];
          })}
        </div>
      </div>
    </section>
  );
}
