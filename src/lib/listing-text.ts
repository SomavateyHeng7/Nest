import type { Locale } from "@/i18n/config";
import type { Listing } from "@/types/listing";

/**
 * Owner-written text in the viewer's language when the owner provided it,
 * otherwise the English original. `lang` lets screen readers and the Khmer
 * font rules pick the right treatment for each piece of text.
 */
export function listingTitle(listing: Pick<Listing, "title" | "titleKm">, locale: Locale) {
  const useKm = locale === "km" && Boolean(listing.titleKm);
  return { text: useKm ? listing.titleKm! : listing.title, lang: useKm ? "km" : "en" } as const;
}

export function listingDescription(listing: Pick<Listing, "description" | "descriptionKm">, locale: Locale) {
  const useKm = locale === "km" && Boolean(listing.descriptionKm);
  return { text: useKm ? listing.descriptionKm! : listing.description, lang: useKm ? "km" : "en" } as const;
}
