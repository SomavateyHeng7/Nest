"use client";

import { PenLine } from "lucide-react";

import { WriteReview } from "@/features/reviews/components/write-review";
import { useReviews } from "@/features/reviews/store";
import { getListingById } from "@/features/listings/data";
import { useI18n } from "@/i18n/client";
import type { Stay } from "@/features/booking/types";

/**
 * Asks the renter to review each finished stay they haven't reviewed yet. This
 * is the in-app version of a "how was your stay?" notification; emailing or
 * messaging it needs a backend.
 */
export function ReviewPrompts({ stays }: { stays: Stay[] }) {
  const { d, lt } = useI18n();
  const store = useReviews();

  const due = stays.filter((s) => s.status === "completed" && !store.forStay(s.id));
  if (due.length === 0) return null;

  return (
    <ul className="mt-6 flex flex-col gap-3">
      {due.map((s) => {
        const listing = getListingById(s.listingId);
        if (!listing) return null;
        return (
          <li key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-accent-terracotta/10 p-4">
            <PenLine className="size-5 shrink-0 text-accent-terracotta" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-medium" lang={lt(listing).lang}>
                {d.reviews.prompt.title(lt(listing).text)}
              </p>
              <p className="text-sm text-muted-foreground">{d.reviews.prompt.body}</p>
            </div>
            <WriteReview stay={s} />
          </li>
        );
      })}
    </ul>
  );
}
