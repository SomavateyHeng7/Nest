import type { Locale } from "@/i18n/config";
import { en, type Dictionary } from "@/i18n/dictionaries/en";
import { km } from "@/i18n/dictionaries/km";

export const dictionaries: Record<Locale, Dictionary> = { en, km };

export type { Dictionary };

/** Translate a data value (place, amenity, phrase); falls back to the original text. */
export function term(d: Dictionary, value: string) {
  return d.term[value] ?? value;
}
