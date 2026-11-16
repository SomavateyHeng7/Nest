import { format as dfFormat, formatDistanceToNowStrict, parseISO } from "date-fns";
import { enUS, km } from "date-fns/locale";

import type { Locale } from "@/i18n/config";

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
