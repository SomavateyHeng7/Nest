export const locales = ["en", "km"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "nest-locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "km";
}

export const localeNames: Record<Locale, { native: string; short: string }> = {
  en: { native: "English", short: "EN" },
  km: { native: "ខ្មែរ", short: "ខ្មែរ" },
};

export const currencies = ["USD", "KHR"] as const;
export type Currency = (typeof currencies)[number];

export const defaultCurrency: Currency = "USD";
export const CURRENCY_COOKIE = "nest-currency";

export function isCurrency(value: string | undefined): value is Currency {
  return value === "USD" || value === "KHR";
}

/**
 * Fallback riel per US dollar, used only to *display* prices when the live rate
 * (see rate.ts) can't be fetched. Listings, quotes and payments all stay in USD.
 */
export const KHR_PER_USD = 4100;
