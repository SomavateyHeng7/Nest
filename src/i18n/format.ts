import { format as dfFormat, formatDistanceToNowStrict, parseISO } from "date-fns";
import { enUS, km } from "date-fns/locale";

import type { Currency, Locale } from "@/i18n/config";

const dateLocales = { en: enUS, km };

function toDate(value: Date | string) {
  return typeof value === "string" ? parseISO(value) : value;
}

/** Locale-aware date-fns format. Patterns are date-fns tokens, e.g. "MMM d, yyyy". */
export function formatDate(value: Date | string, pattern: string, locale: Locale) {
  return dfFormat(toDate(value), pattern, { locale: dateLocales[locale] });
}

export function formatRelative(value: Date | string, locale: Locale) {
  return formatDistanceToNowStrict(toDate(value), { addSuffix: true, locale: dateLocales[locale] });
}

export function formatDateRange(start: string, end: string, locale: Locale) {
  const a = parseISO(start);
  const b = parseISO(end);
  const sameYear = a.getFullYear() === b.getFullYear();
  const sameMonth = sameYear && a.getMonth() === b.getMonth();
  if (sameMonth) return `${formatDate(a, "MMM d", locale)} – ${formatDate(b, "d, yyyy", locale)}`;
  if (sameYear) return `${formatDate(a, "MMM d", locale)} – ${formatDate(b, "MMM d, yyyy", locale)}`;
  return `${formatDate(a, "MMM d, yyyy", locale)} – ${formatDate(b, "MMM d, yyyy", locale)}`;
}

const usd = (digits: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });
const usdWhole = usd(0);
const usdCents = usd(2);
const rielNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Round to the nearest 100៛ (the smallest note in everyday use), so prices read like real riel prices. */
export function toRiel(amountUSD: number, rate: number) {
  return Math.round((amountUSD * rate) / 100) * 100;
}

/**
 * Format an amount held in USD for display. Every price in the app is stored
 * in USD; "KHR" only converts what is shown, at `rate` riel per dollar.
 * `cents` applies to USD only.
 */
export function formatMoney(amountUSD: number, currency: Currency, rate: number, opts: { cents?: boolean } = {}) {
  if (currency === "KHR") return `${rielNumber.format(toRiel(amountUSD, rate))}៛`;
  return (opts.cents ? usdCents : usdWhole).format(amountUSD);
}
