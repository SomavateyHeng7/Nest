import { cookies } from "next/headers";

import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { dictionaries, term, type Dictionary } from "@/i18n";
import { formatDate, formatDateRange, formatRelative } from "@/i18n/format";
import { listingTitle } from "@/lib/listing-text";
import type { Listing } from "@/types/listing";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : defaultLocale;
}

/** Server-side translation helpers for Server Components. */
export async function getI18n() {
  const locale = await getLocale();
  const d: Dictionary = dictionaries[locale];
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
}
