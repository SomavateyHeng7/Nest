import type { Metadata } from "next";

import { AvailabilityManager } from "@/features/owner/components/availability-manager";
import { OwnerShell } from "@/features/owner/components/owner-nav";
import { ownerBookings } from "@/features/booking/data";
import { ownerListingIds } from "@/features/owner/data";
import { getListingById } from "@/features/listings/data";
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
