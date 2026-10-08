import { Suspense } from "react";
import Link from "next/link";

import { HomeListings } from "@/components/listing/home-listings";
import { ListingFilterBar } from "@/components/listing/listing-filter-bar";
import { listings } from "@/data/listings";
import { ANYWHERE } from "@/lib/destinations";

export default async function ListingsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const destination = typeof params.destination === "string" ? params.destination : undefined;
  const guests = typeof params.guests === "string" ? Number(params.guests) : undefined;

  const filtered = listings.filter((listing) => {
    if (destination && destination !== ANYWHERE && listing.city !== destination) return false;
    if (guests && guests > 1 && listing.guests < guests) return false;
    return true;
  });

  const hasFilters = Boolean(destination) || Boolean(guests && guests > 1);

  return (
    <div>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-10 sm:px-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {destination && destination !== ANYWHERE ? `Stays in ${destination}` : "All stays in Cambodia"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "place" : "places"} to stay
            {guests && guests > 1 ? ` for ${guests} guests` : ""}
          </p>
        </div>

        <Suspense fallback={<div className="h-14 rounded-xl border border-border bg-card" />}>
          <ListingFilterBar />
        </Suspense>
      </div>

      {filtered.length === 0 && hasFilters ? (
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <p className="text-sm text-muted-foreground">
            No stays match those filters yet.{" "}
            <Link href="/listing" className="text-primary-sage underline underline-offset-4">
              Clear filters
            </Link>{" "}
            to see everything.
          </p>
        </div>
      ) : (
        <HomeListings listings={filtered} />
      )}
    </div>
  );
}
