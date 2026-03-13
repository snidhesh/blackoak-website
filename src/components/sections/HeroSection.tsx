import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  label?: string;
  image?: string;
  overlay?: boolean;
  height?: 'full' | 'large' | 'medium' | 'small';
  children?: React.ReactNode;
}

const heights = {
  full: 'min-h-screen',
  large: 'min-h-[70vh]',
  medium: 'min-h-[50vh]',
  small: 'min-h-[40vh]',
};

export default function HeroSection({
  title,
  subtitle,
  label,
  image,
  overlay = true,
  height = 'medium',
  children,
}: HeroSectionProps) {
  return (
    <section className={cn('relative flex items-center justify-center', heights[height])}>
      {image && (
        <>
          <Image
            src={image}
            alt=""
            fill
            className="object-cover"
            priority
          />
          {overlay && <div className="absolute inset-0 bg-black/40" />}
        </>
      )}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        {label && (
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-white/60" />
            <span className="text-xs tracking-[0.2em] uppercase text-white/80">{label}</span>
            <span className="h-px w-8 bg-white/60" />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
