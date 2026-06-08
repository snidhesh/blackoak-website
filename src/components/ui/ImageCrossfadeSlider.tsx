'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Props {
  images: string[];
  alt: string;
  /** Auto-advance interval in ms. Default 5000. Set 0 to disable. */
  interval?: number;
  /** Image `sizes` attribute */
  sizes?: string;
  /** Where the pagination dots appear */
  dotsPosition?: 'bottom-center' | 'bottom-right' | 'top-right' | 'none';
  /** Apply Next/Image priority to the first slide. */
  priorityFirst?: boolean;
  /** Render a subtle dark gradient at the bottom of each slide. */
  bottomGradient?: boolean;
}

/** Lightweight auto-advancing image slider with cross-fade — no external deps. */
export default function ImageCrossfadeSlider({
  images,
  alt,
  interval = 5000,
  sizes,
  dotsPosition = 'bottom-center',
  priorityFirst = false,
  bottomGradient = false,
}: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1 || interval <= 0) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [images.length, interval]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      {images.map((src, i) => (
        <Image
          key={src + i}
          src={src}
          alt={`${alt} ${i + 1}`}
          fill
          priority={priorityFirst && i === 0}
          className={`object-cover transition-opacity duration-[800ms] ease-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
          sizes={sizes}
        />
      ))}
      {bottomGradient && (
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
      )}

      {images.length > 1 && dotsPosition !== 'none' && (
        <div
          className={`absolute z-10 flex items-center gap-1.5 ${
            dotsPosition === 'bottom-center'
              ? 'bottom-3 inset-x-0 justify-center'
              : dotsPosition === 'top-right'
              ? 'top-4 md:top-6 end-4 md:end-6'
              : 'bottom-3 end-3'
          }`}
        >
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
