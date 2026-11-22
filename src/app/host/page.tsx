import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, CalendarCheck, Inbox, Percent, Plus, Wallet } from "lucide-react";

import { BookingRequests } from "@/features/owner/components/booking-requests";
import { ExtensionRequests } from "@/features/owner/components/extension-requests";
import { OwnerVerification } from "@/features/owner/components/owner-verification";
import { OwnerShell } from "@/features/owner/components/owner-nav";
import { MyDisputes } from "@/features/disputes/components/my-disputes";
import { OwnerReviews } from "@/features/reviews/components/owner-reviews";
import { OwnerViewings } from "@/features/viewings/components/owner-viewings";
import { StatusBadge } from "@/features/booking/components/status-badge";
import { StatTile } from "@/shared/ui/stat-tile";
import { monthlyIncome, ownerListingIds, ownerListingStatus } from "@/features/owner/data";
import { ownerBookings, stays } from "@/features/booking/data";
import { ownerViewings } from "@/features/viewings/data";
import { getListingById } from "@/features/listings/data";
import { getI18n } from "@/i18n/server";


export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.nav.ownerDashboard };
}

const occupancy: Record<string, number> = {
  "bkk1-garden-condo": 92,
  "chroy-changvar-view-condo": 0,
  "bassac-service-apartment": 100,
};

export default async function HostPage() {
  const { d, lt, money } = await getI18n();
  const o = d.owner;
  const myListings = ownerListingIds.map(getListingById).filter((l) => l !== undefined);
  const pending = ownerBookings.filter((b) => b.status === "pending");
  const upcoming = ownerBookings.filter((b) => b.status === "confirmed");
  const thisMonth = monthlyIncome[monthlyIncome.length - 1];
  const live = myListings.filter((l) => ownerListingStatus[l.id] === "live");
  const avgOccupancy = Math.round(live.reduce((s, l) => s + occupancy[l.id], 0) / (live.length || 1));

  return (
    <OwnerShell
      title={o.welcome("Sokha")}
      description={o.attention}
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={o.stats.requests} value={String(pending.length)} hint={o.stats.requestsHint} icon={<Inbox className="size-4.5" />} />
        <StatTile label={o.stats.rent} value={money(thisMonth.rent)} hint={o.stats.rentHint} icon={<Wallet className="size-4.5" />} />
        <StatTile label={o.stats.occupancy} value={`${avgOccupancy}%`} hint={o.stats.occupancyHint} icon={<Percent className="size-4.5" />} />
        <StatTile label={o.stats.moveIns} value={String(upcoming.length)} hint={o.stats.moveInsHint} icon={<CalendarCheck className="size-4.5" />} />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <h2 className="font-semibold">{o.requestsTitle}</h2>
            <span className="text-sm text-muted-foreground">{o.requestsNote}</span>
          </div>
          <BookingRequests bookings={[...pending, ...upcoming]} />
        </section>
        <ExtensionRequests stays={stays} />
        <OwnerViewings viewings={ownerViewings} />
        <section className="mt-10">
          <OwnerReviews listingIds={ownerListingIds} />
        </section>
        <OwnerVerification />
        <MyDisputes party="owner" />
        </div>

        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <h2 className="font-semibold">{o.properties}</h2>
            <Link href="/host/calendar" className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
              {o.manageCalendar}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {myListings.map((l) => (
              <Link
                key={l.id}
                href={`/listing/${l.id}`}
                className="flex gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-foreground/25"
              >
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={l.images[0]} alt={lt(l).text} fill sizes="80px" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate text-sm font-semibold" lang={lt(l).lang}>{lt(l).text}</p>
                  <StatusBadge status={ownerListingStatus[l.id]} className="w-fit" />
                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BedDouble className="size-3.5" />
                      {o.perMonthShort(money(l.pricing.monthly))}
                    </span>
                    {ownerListingStatus[l.id] === "live" && <span className="tabular">{o.booked(occupancy[l.id])}</span>}
                  </div>
                </div>
              </Link>
            ))}
            <Link
              href="/host/new"
              className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-6 text-sm font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            >
              <Plus className="size-4" />
              {o.addAnother}
            </Link>
          </div>
        </section>
      </div>
    </OwnerShell>
  );
}
