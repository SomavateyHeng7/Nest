"use client";

import { Heart } from "lucide-react";

import { useActivity } from "@/components/activity/activity-provider";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types/listing";

/** Heart toggle. `overlay` sits on a photo; `labelled` is the listing-page button with text. */
export function SaveButton({
  listing,
  variant = "overlay",
  className,
}: {
  listing: Listing;
  variant?: "overlay" | "labelled";
  className?: string;
}) {
  const { isSaved, toggleSaved, ready } = useActivity();
  const { d, lt } = useI18n();
  const saved = ready && isSaved(listing.id);
  const title = lt(listing).text;

  return (
    <button
      type="button"
      onClick={() => toggleSaved(listing.id)}
      aria-pressed={saved}
      aria-label={saved ? d.saved.unsaveAria(title) : d.saved.saveAria(title)}
      className={cn(
        "relative z-10 inline-flex shrink-0 items-center justify-center gap-1.5 transition-colors",
        variant === "overlay"
          ? "size-8 rounded-full bg-background/95 shadow-sm hover:bg-background"
          : "h-9 rounded-full border border-border bg-card px-3.5 text-sm font-medium hover:border-foreground/30",
        className
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-transform active:scale-90",
          saved ? "fill-accent-terracotta text-accent-terracotta" : "text-foreground"
        )}
      />
      {variant === "labelled" && (saved ? d.saved.saved : d.saved.save)}
    </button>
  );
}
