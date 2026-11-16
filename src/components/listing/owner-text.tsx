"use client";

import { useState } from "react";
import { Languages } from "lucide-react";

import { useI18n } from "@/i18n/client";
import type { Listing } from "@/types/listing";

/**
 * Owner-written description. Shows the owner's Khmer version to Khmer readers
 * when there is one, with a toggle back to the English original (and the
 * reverse for English readers).
 */
export function OwnerDescription({ listing }: { listing: Pick<Listing, "description" | "descriptionKm"> }) {
  const { d, locale } = useI18n();
  const t = d.listing.ownerText;
  const hasKhmer = Boolean(listing.descriptionKm);
  const preferKhmer = locale === "km" && hasKhmer;
  const [showKhmer, setShowKhmer] = useState(preferKhmer);
  // Follow the site language when it changes.
  const [lastLocale, setLastLocale] = useState(locale);
  if (lastLocale !== locale) {
    setLastLocale(locale);
    setShowKhmer(locale === "km" && hasKhmer);
  }

  const khmer = showKhmer && hasKhmer;

  return (
    <div>
      <p className="leading-relaxed text-foreground/90" lang={khmer ? "km" : "en"}>
        {khmer ? listing.descriptionKm : listing.description}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Languages className="size-3.5" />
          {khmer ? t.khmerByOwner : locale === "km" ? t.englishOnly : t.byOwner}
        </span>
        {hasKhmer && (
          <button
            type="button"
            onClick={() => setShowKhmer((v) => !v)}
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary-sage"
          >
            {khmer ? t.showOriginal : t.showKhmer}
          </button>
        )}
      </div>
    </div>
  );
}
