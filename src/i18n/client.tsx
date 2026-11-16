"use client";

import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { dictionaries, term } from "@/i18n";
import { formatDate, formatDateRange, formatRelative } from "@/i18n/format";
import { listingTitle } from "@/features/listings/lib/listing-text";
import type { Listing } from "@/features/listings/types";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  pending: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState(initialLocale);
  const [pending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      setLocaleState(next);
      // Re-render Server Components with the new cookie.
      startTransition(() => router.refresh());
    },
    [router]
  );

  const value = useMemo(() => ({ locale, setLocale, pending }), [locale, setLocale, pending]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}

/** Client-side translation helpers, mirroring getI18n() on the server. */
export function useI18n() {
  const { locale } = useLocale();
  return useMemo(() => {
    const d = dictionaries[locale];
    return {
      locale,
      d,
      t: (value: string) => term(d, value),
      date: (value: Date | string, pattern: string) => formatDate(value, pattern, locale),
      range: (start: string, end: string) => formatDateRange(start, end, locale),
      relative: (value: Date | string) => formatRelative(value, locale),
      /** Owner-written listing title in the viewer's language when available. */
      lt: (listing: Pick<Listing, "title" | "titleKm">) => listingTitle(listing, locale),
    };
  }, [locale]);
}
