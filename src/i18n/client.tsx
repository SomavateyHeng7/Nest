"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { CURRENCY_COOKIE, LOCALE_COOKIE, type Currency, type Locale } from "@/i18n/config";
import { dictionaries, term } from "@/i18n";
import { formatDate, formatDateRange, formatMoney, formatRelative } from "@/i18n/format";
import { listingTitle } from "@/features/listings/lib/listing-text";
import type { Listing } from "@/features/listings/types";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  currency: Currency;
  /** Riel per US dollar, for showing prices in KHR. */
  khrRate: number;
  setCurrency: (currency: Currency) => void;
  pending: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  initialCurrency,
  khrRate,
  children,
}: {
  initialLocale: Locale;
  initialCurrency: Currency;
  khrRate: number;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState(initialLocale);
  const [currency, setCurrencyState] = useState(initialCurrency);
  const [pending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      // One transition for state + refresh: old UI stays until the new Server Components arrive, so text swaps together.
      startTransition(() => {
        setLocaleState(next);
        router.refresh();
      });
    },
    [router]
  );

  const setCurrency = useCallback(
    (next: Currency) => {
      document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      startTransition(() => {
        setCurrencyState(next);
        router.refresh();
      });
    },
    [router]
  );

  // Drives the soft fade on <main> in globals.css while the switch is in flight.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-switching", pending);
  }, [pending]);

  const value = useMemo(
    () => ({ locale, setLocale, currency, setCurrency, khrRate, pending }),
    [locale, setLocale, currency, setCurrency, khrRate, pending]
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}

/** Client-side translation helpers, mirroring getI18n() on the server. */
export function useI18n() {
  const { locale, currency, khrRate } = useLocale();
  return useMemo(() => {
    const d = dictionaries[locale];
    return {
      locale,
      currency,
      rate: khrRate,
      d,
      t: (value: string) => term(d, value),
      date: (value: Date | string, pattern: string) => formatDate(value, pattern, locale),
      range: (start: string, end: string) => formatDateRange(start, end, locale),
      relative: (value: Date | string) => formatRelative(value, locale),
      /** A USD amount in the viewer's chosen currency (USD or KHR). */
      money: (amountUSD: number, opts?: { cents?: boolean }) => formatMoney(amountUSD, currency, khrRate, opts),
      /** Owner-written listing title in the viewer's language when available. */
      lt: (listing: Pick<Listing, "title" | "titleKm">) => listingTitle(listing, locale),
    };
  }, [locale, currency, khrRate]);
}
