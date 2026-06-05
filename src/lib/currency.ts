import type { Locale } from '@/i18n/config';

export const CURRENCIES = [
  { code: 'AED' as const, symbol: 'د.إ', name: 'AED', hasIcon: true },
  { code: 'USD' as const, symbol: '$', name: 'USD' },
  { code: 'EUR' as const, symbol: '€', name: 'EUR' },
  { code: 'GBP' as const, symbol: '£', name: 'GBP' },
] as const;

export type CurrencyCode = 'AED' | 'USD' | 'EUR' | 'GBP';

// 1 AED = X target currency
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  AED: 1,
  USD: 0.2723,
  EUR: 0.2516,
  GBP: 0.2154,
};

export const VALID_CURRENCY_CODES = new Set<string>(['AED', 'USD', 'EUR', 'GBP']);

// Duplicated from formatters.ts to avoid cross-module import that breaks webpack chunk splitting
const INTL_LOCALE: Record<Locale, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-AE-u-nu-arab' };

export function convertPrice(aedPrice: number, currency: CurrencyCode): number {
  return Math.round(aedPrice * EXCHANGE_RATES[currency]);
}

export function formatCompactPrice(
  aedPrice: number,
  currency: CurrencyCode,
  locale: Locale
): string {
  const converted = convertPrice(aedPrice, currency);
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(converted);
}
