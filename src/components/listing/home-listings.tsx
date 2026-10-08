"use client";

import { useMemo, useState } from "react";

import { ListingCard } from "@/components/listing/listing-card";
import { cn } from "@/lib/utils";
import type { Listing, ListingCategory } from "@/types/listing";

const categories: { value: ListingCategory | "all"; label: string }[] = [
  { value: "all", label: "All stays" },
  { value: "apartment", label: "Apartments" },
  { value: "villa", label: "Villas" },
  { value: "guesthouse", label: "Guesthouses" },
  { value: "riverside-bungalow", label: "Riverside bungalows" },
  { value: "boutique-hotel", label: "Boutique hotels" },
];

export function HomeListings({ listings }: { listings: Listing[] }) {
  const [category, setCategory] = useState<ListingCategory | "all">("all");

  const filtered = useMemo(
    () => (category === "all" ? listings : listings.filter((l) => l.category === category)),
    [listings, category]
  );

  return (
    <section id="listings" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCategory(c.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              category === c.value
                ? "border-primary-sage bg-primary-sage text-white"
                : "border-border bg-transparent text-foreground hover:bg-muted"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No stays in this category yet — check back soon.
        </p>
      )}
    </section>
  );
}
