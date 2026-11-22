"use client";

import { useEffect } from "react";

import { ListingCard } from "@/features/listings/components/listing-card";
import { getListingById } from "@/features/listings/data";
import { createPersistedStore } from "@/shared/lib/persisted-store";
import { useI18n } from "@/i18n/client";
import type { Listing } from "@/features/listings/types";

const MAX_RECENT = 6;

/** Listing ids, most recently opened first. Kept in this browser only. */
const useRecentStore = createPersistedStore<string[]>("nest.recentlyViewed", []);

/** Renders nothing; records that this listing was opened. Put it on the listing page. */
export function RecordView({ listingId }: { listingId: string }) {
  const [, update] = useRecentStore();
  useEffect(() => {
    update((ids) => [listingId, ...ids.filter((id) => id !== listingId)].slice(0, MAX_RECENT));
  }, [listingId, update]);
  return null;
}

/** A row of homes the person looked at before, hidden until there is at least one. */
export function RecentlyViewed({ excludeId, className }: { excludeId?: string; className?: string }) {
  const { d } = useI18n();
  const [ids, update] = useRecentStore();
  const items = ids
    .filter((id) => id !== excludeId)
    .map(getListingById)
    .filter((l): l is Listing => l !== undefined)
    .slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className={className} aria-labelledby="recently-viewed">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 id="recently-viewed" className="font-heading text-xl font-semibold tracking-tight text-dark-forest">
          {d.recent.title}
        </h2>
        <button
          type="button"
          onClick={() => update(() => [])}
          className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {d.recent.clear}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((l) => (
          <ListingCard key={l.id} listing={l} showCompare={false} />
        ))}
      </div>
    </section>
  );
}
