import type { Metadata } from "next";

import { AvailabilityManager } from "@/components/dashboard/availability-manager";
import { OwnerShell } from "@/components/dashboard/owner-nav";
import { ownerBookings, ownerListingIds } from "@/data/dashboard";
import { getListingById } from "@/data/listings";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.calendar.title };
}

export default async function HostCalendarPage() {
  const { d } = await getI18n();
  const myListings = ownerListingIds.map(getListingById).filter((l) => l !== undefined);

  return (
    <OwnerShell title={d.calendar.title} description={d.calendar.sub}>
      <AvailabilityManager listings={myListings} bookings={ownerBookings} />
    </OwnerShell>
  );
}
