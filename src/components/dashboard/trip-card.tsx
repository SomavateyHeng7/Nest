import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { getListingById } from "@/data/listings";
import { formatDateRange } from "@/lib/format-date-range";
import type { Trip } from "@/types/dashboard";

export function TripCard({ trip }: { trip: Trip }) {
  const listing = getListingById(trip.listingId);
  if (!listing) return null;

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="flex gap-4 rounded-xl border border-border p-3 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{listing.title}</p>
          <StatusBadge status={trip.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {listing.city}, {listing.province}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatDateRange(trip.checkIn, trip.checkOut)} · {trip.guests} guest{trip.guests > 1 ? "s" : ""}
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">${trip.total} total</p>
      </div>
    </Link>
  );
}
