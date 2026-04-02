'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/config';

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile';
  scrolled?: boolean;
}

const UKFlag = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 14" fill="none">
    <rect width="20" height="14" rx="1" fill="#012169" />
    <path d="M0 0L20 14M20 0L0 14" stroke="#fff" strokeWidth="2.4" />
    <path d="M0 0L20 14M20 0L0 14" stroke="#C8102E" strokeWidth="1" />
    <path d="M10 0V14M0 7H20" stroke="#fff" strokeWidth="4" />
    <path d="M10 0V14M0 7H20" stroke="#C8102E" strokeWidth="2" />
  </svg>
);

const FranceFlag = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 14" fill="none">
    <rect width="6.67" height="14" fill="#002395" />
    <rect x="6.67" width="6.67" height="14" fill="#fff" />
    <rect x="13.33" width="6.67" height="14" fill="#ED2939" />
  </svg>
);

const UAEFlag = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 14" fill="none">
    <rect width="20" height="4.67" fill="#00732F" />
    <rect y="4.67" width="20" height="4.67" fill="#fff" />
    <rect y="9.33" width="20" height="4.67" fill="#000" />
    <rect width="5.5" height="14" fill="#FF0000" />
  </svg>
);

const LANGUAGES = [
  { locale: 'en' as Locale, label: 'EN', name: 'English', Flag: UKFlag },
  { locale: 'fr' as Locale, label: 'FR', name: 'Français', Flag: FranceFlag },
  { locale: 'ar' as Locale, label: 'AR', name: 'العربية', Flag: UAEFlag },
];

export default function LanguageSwitcher({ variant = 'desktop', scrolled }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  // Sync dir + lang on <html> after client-side locale navigation
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', locale);
  }, [locale]);

  const current = LANGUAGES.find((l) => l.locale === locale) ?? LANGUAGES[0];
  const others = LANGUAGES.filter((l) => l.locale !== locale);

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col gap-1">
        {LANGUAGES.map(({ locale: loc, name, Flag }) => (
          <Link
            key={loc}
            href={pathname}
            locale={loc}
            className={`flex items-center gap-3 w-full py-3 text-[16px] font-medium transition-colors ${
              loc === locale ? 'text-gold' : 'text-white hover:text-gold'
            }`}
          >
            <Flag className="w-5 h-3.5 shrink-0" />
            {name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-[6px] px-3 py-1.5 rounded-full border text-[12px] font-medium tracking-wider transition-colors ${
          scrolled
            ? 'border-black/20 text-black hover:bg-black/5'
            : 'border-white/30 text-white hover:bg-white/10'
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <current.Flag className="w-4 h-3" />
        {current.label}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5l3 3 3-3" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1 end-0 min-w-[140px] bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50 animate-slide-down">
          {others.map(({ locale: loc, label, name, Flag }) => (
            <Link
              key={loc}
              href={pathname}
              locale={loc}
              prefetch={false}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-dark hover:bg-gray-50 transition-colors"
            >
              <Flag className="w-4 h-3 shrink-0" />
              <span>{label}</span>
              <span className="text-gray-400 text-xs">{name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
