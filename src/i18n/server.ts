import { cookies } from "next/headers";

import {
  CURRENCY_COOKIE,
  defaultCurrency,
  defaultLocale,
  isCurrency,
  isLocale,
  LOCALE_COOKIE,
  type Currency,
  type Locale,
} from "@/i18n/config";
import { dictionaries, term, type Dictionary } from "@/i18n";
import { getKhrRate } from "@/i18n/rate";
import { formatDate, formatDateRange, formatMoney, formatRelative } from "@/i18n/format";
import { listingTitle } from "@/features/listings/lib/listing-text";
import type { Listing } from "@/features/listings/types";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function getCurrency(): Promise<Currency> {
  const value = (await cookies()).get(CURRENCY_COOKIE)?.value;
  return isCurrency(value) ? value : defaultCurrency;
}

/** Server-side translation helpers for Server Components. */
export async function getI18n() {
  const [locale, currency, rate] = await Promise.all([getLocale(), getCurrency(), getKhrRate()]);
  const d: Dictionary = dictionaries[locale];
  return {
    locale,
    currency,
    rate,
    d,
    t: (value: string) => term(d, value),
    date: (value: Date | string, pattern: string) => formatDate(value, pattern, locale),
    range: (start: string, end: string) => formatDateRange(start, end, locale),
    relative: (value: Date | string) => formatRelative(value, locale),
    /** A USD amount in the viewer's chosen currency (USD or KHR). */
    money: (amountUSD: number, opts?: { cents?: boolean }) => formatMoney(amountUSD, currency, rate, opts),
    /** Owner-written listing title in the viewer's language when available. */
    lt: (listing: Pick<Listing, "title" | "titleKm">) => listingTitle(listing, locale),
  };
}
