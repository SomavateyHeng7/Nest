"use client";

import { Star } from "lucide-react";

import { useReviews } from "@/features/reviews/store";
import { useI18n } from "@/i18n/client";

/** Rating under a listing's title, from the reviews currently published. */
export function ListingRating({ listingId }: { listingId: string }) {
  const { d } = useI18n();
  const summary = useReviews().summary(listingId);

  if (summary.count === 0) {
    return <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">{d.reviews.new}</span>;
  }
  return (
    <a href="#reviews" className="flex items-center gap-1 text-foreground hover:underline">
      <Star className="size-4 fill-current text-accent-terracotta" aria-hidden />
      <span className="font-medium tabular">{summary.average.toFixed(1)}</span>
      <span className="text-muted-foreground">· {d.common.reviews(summary.count)}</span>
    </a>
  );
}
