'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/config';

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile';
  scrolled?: boolean;
}

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

export default function LanguageSwitcher({ variant = 'desktop', scrolled }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const otherLocale: Locale = locale === 'en' ? 'fr' : 'en';
  const label = otherLocale === 'fr' ? 'FR' : 'EN';

  if (variant === 'mobile') {
    return (
      <Link
        href={pathname}
        locale={otherLocale}
        className="flex items-center gap-3 w-full py-3 text-[16px] font-medium text-white hover:text-gold transition-colors"
      >
        <GlobeIcon className="w-5 h-5" />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={pathname}
      locale={otherLocale}
      className={`flex items-center gap-[6px] px-3 py-1.5 rounded-full border text-[12px] font-medium tracking-wider transition-colors ${
        scrolled
          ? 'border-black/20 text-black hover:bg-black/5'
          : 'border-white/30 text-white hover:bg-white/10'
      }`}
    >
      <GlobeIcon className="w-4 h-4" />
      {label}
    </Link>
  );
}
