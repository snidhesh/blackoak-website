'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/context/CurrencyContext';
import { CURRENCIES, type CurrencyCode } from '@/lib/currency';

interface CurrencySwitcherProps {
  variant?: 'desktop' | 'mobile';
  scrolled?: boolean;
}

export default function CurrencySwitcher({ variant = 'desktop', scrolled }: CurrencySwitcherProps) {
  const { currency, setCurrency, currencyInfo } = useCurrency();
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

  const others = CURRENCIES.filter((c) => c.code !== currency);

  if (variant === 'mobile') {
    return (
      <div className="flex flex-col gap-1">
        {CURRENCIES.map((c) => (
          <button
            key={c.code}
            onClick={() => setCurrency(c.code as CurrencyCode)}
            className={`flex items-center gap-3 w-full py-3 text-[16px] font-medium transition-colors ${
              c.code === currency ? 'text-gold' : 'text-white hover:text-gold'
            }`}
          >
            <span className="w-5 text-center shrink-0">{c.symbol}</span>
            {c.name}
          </button>
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
        <span className="text-[11px]">{currencyInfo.symbol}</span>
        {currency}
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 12 12"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5l3 3 3-3" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1 end-0 min-w-[120px] bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50 animate-slide-down">
          {others.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCurrency(c.code as CurrencyCode);
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-dark hover:bg-gray-50 transition-colors w-full"
            >
              <span className="text-xs w-4 text-center">{c.symbol}</span>
              <span>{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
