'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

export interface SnapshotFrame {
  src: string;
  alt: string;
  /** Short section name shown over the frame, e.g. "Scenario simulator". */
  label: string;
}

interface TileSnapshotSliderProps {
  frames: SnapshotFrame[];
  /** Accessible name for the whole carousel, e.g. "Preview of Market Intelligence". */
  ariaLabel: string;
  prevLabel: string;
  nextLabel: string;
  /** Accessible name for each dot; receives the 1-based frame number. */
  goToLabel: (n: number) => string;
  intervalMs?: number;
}

const SWIPE_THRESHOLD_PX = 40;

// A small, dependency-free carousel for the Intelligence Hub tiles: one real
// capture per product feature, slow auto-advance that stops on hover, focus,
// touch, a hidden tab or a reduced-motion preference. Always laid out LTR: the
// frames are screenshots of LTR pages and the arrows are physical directions.
export default function TileSnapshotSlider({
  frames,
  ariaLabel,
  prevLabel,
  nextLabel,
  goToLabel,
  intervalMs = 6000,
}: TileSnapshotSliderProps) {
  const count = frames.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const pointerStartX = useRef<number | null>(null);

  const goTo = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (paused || hidden || reduceMotion || count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [paused, hidden, reduceMotion, count, intervalMs]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    setPaused(true);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = pointerStartX.current;
    pointerStartX.current = null;
    if (start === null) return;
    const dx = e.clientX - start;
    if (dx <= -SWIPE_THRESHOLD_PX) goTo(index + 1);
    else if (dx >= SWIPE_THRESHOLD_PX) goTo(index - 1);
  };

  const arrowClass =
    'absolute top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-sm transition-colors [@media(hover:hover)]:hover:bg-gold [@media(hover:hover)]:hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';

  return (
    <div
      dir="ltr"
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className="group/slider relative select-none border-b border-gray-200 bg-[#f6f5f2]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div
        className="relative aspect-[2/1] touch-pan-y overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {frames.map((frame, i) => (
            <div
              key={frame.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              aria-hidden={i !== index}
              className="relative h-full w-full shrink-0"
            >
              <Image
                src={frame.src}
                alt={frame.alt}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
                className="object-cover object-top"
              />
            </div>
          ))}
        </div>

        {/* Section name and dots on solid dark pills, so they read on the light
            chart frames as well as the dark Briefing ones. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/50 to-transparent px-3 pb-3 pt-14 sm:px-4">
          <p
            aria-live="polite"
            className="inline-flex items-center gap-2.5 rounded-sm bg-black/85 px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-white shadow-md backdrop-blur-sm"
          >
            <span aria-hidden="true" className="block h-3 w-[3px] shrink-0 bg-gold" />
            {frames[index].label}
          </p>
          {count > 1 && (
            <div
              className="pointer-events-auto flex h-8 items-center gap-1 rounded-sm bg-black/85 px-2 shadow-md backdrop-blur-sm"
              role="tablist"
            >
              {frames.map((frame, i) => (
                <button
                  key={frame.src}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={goToLabel(i + 1)}
                  onClick={() => goTo(i)}
                  className="flex h-8 w-4 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none',
                      i === index ? 'w-4 bg-gold' : 'w-1.5 bg-white/80',
                    )}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label={prevLabel}
            onClick={() => goTo(index - 1)}
            className={cn(arrowClass, 'left-3')}
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={() => goTo(index + 1)}
            className={cn(arrowClass, 'right-3')}
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
