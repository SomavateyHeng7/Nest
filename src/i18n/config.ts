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
