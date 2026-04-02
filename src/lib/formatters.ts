import type { Locale } from '@/i18n/config';

const LOCALE_MAP: Record<Locale, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-AE-u-nu-arab' };

export function formatPrice(price: number, currency: string = 'AED', locale: Locale = 'en'): string {
  return `${currency} ${price.toLocaleString(LOCALE_MAP[locale])}`;
}

export function formatPriceNumber(price: number, locale: Locale = 'en'): string {
  return price.toLocaleString(LOCALE_MAP[locale]);
}

export function formatArea(area: number, locale: Locale = 'en'): string {
  return area.toLocaleString(LOCALE_MAP[locale]);
}

export function formatDate(dateString: string, locale: Locale = 'en'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(LOCALE_MAP[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
