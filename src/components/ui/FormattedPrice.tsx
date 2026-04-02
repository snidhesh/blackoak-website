'use client';

import { useLocale } from 'next-intl';
import { useCurrency } from '@/context/CurrencyContext';
import { formatPriceNumber } from '@/lib/formatters';
import type { Locale } from '@/i18n/config';
import DirhamIcon from '@/components/ui/DirhamIcon';

interface FormattedPriceProps {
  price: number; // always in AED
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  light?: boolean; // for dark backgrounds (invert DirhamIcon)
}

const SIZE_CONFIG = {
  sm: { icon: 14, text: 'text-lg', gap: 'gap-1.5' },
  md: { icon: 16, text: 'text-[24px] leading-[28px]', gap: 'gap-2' },
  lg: { icon: 18, text: 'text-[28px]', gap: 'gap-2' },
} as const;

export default function FormattedPrice({
  price,
  size = 'sm',
  className = '',
  light = false,
}: FormattedPriceProps) {
  const locale = useLocale() as Locale;
  const { currency, convertPrice, currencyInfo } = useCurrency();
  const converted = convertPrice(price);
  const config = SIZE_CONFIG[size];

  return (
    <span className={`inline-flex items-center ${config.gap} ${className}`}>
      {currency === 'AED' ? (
        <DirhamIcon size={config.icon} className={`shrink-0 ${light ? 'invert' : ''}`} />
      ) : (
        <span className={light ? 'text-white' : ''}>{currencyInfo.symbol}</span>
      )}
      <span>{formatPriceNumber(converted, locale)}</span>
    </span>
  );
}
