'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  CURRENCIES,
  VALID_CURRENCY_CODES,
  convertPrice as convertPriceFn,
  type CurrencyCode,
} from '@/lib/currency';

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  convertPrice: (aedPrice: number) => number;
  currencyInfo: (typeof CURRENCIES)[number];
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = 'currency';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('AED');

  // Sync from localStorage on mount (avoids hydration mismatch by defaulting to AED)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && VALID_CURRENCY_CODES.has(stored)) {
        setCurrencyState(stored as CurrencyCode);
      }
    } catch {
      // localStorage unavailable (SSR, private browsing, etc.)
    }
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const convertPrice = useCallback(
    (aedPrice: number) => convertPriceFn(aedPrice, currency),
    [currency]
  );

  const currencyInfo = useMemo(
    () => CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0],
    [currency]
  );

  const value = useMemo(
    () => ({ currency, setCurrency, convertPrice, currencyInfo }),
    [currency, setCurrency, convertPrice, currencyInfo]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
