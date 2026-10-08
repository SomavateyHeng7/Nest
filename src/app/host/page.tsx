import Link from "next/link";

import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { ReservationRow } from "@/components/dashboard/reservation-row";
import { ListingCard } from "@/components/listing/listing-card";
import { StatTile } from "@/components/ui/stat-tile";
import { getListingById } from "@/data/listings";
import { hostListingIds, reservations } from "@/data/dashboard";

export default function HostPage() {
  const myListings = hostListingIds.map(getListingById).filter((l): l is NonNullable<typeof l> => Boolean(l));
  const upcomingReservations = reservations.filter((r) => r.status === "upcoming");
  const avgRating =
    myListings.reduce((sum, l) => sum + l.rating, 0) / (myListings.length || 1);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Hosting on Nest Cambodia</h1>
      <DashboardTabs />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Active listings" value={String(myListings.length)} />
        <StatTile label="Upcoming reservations" value={String(upcomingReservations.length)} />
        <StatTile label="Average rating" value={avgRating.toFixed(2)} hint="Across your listings" />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-foreground">Your listings</h2>
          <Link href="/earning" className="text-sm text-primary-sage underline underline-offset-4">
            View earnings
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
          {myListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-foreground">Reservations</h2>
        {reservations.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No reservations yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reservations.map((reservation) => (
              <ReservationRow key={reservation.id} reservation={reservation} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
