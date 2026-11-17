"use client";

import Image from "next/image";
import Link from "next/link";
import { differenceInCalendarDays, parseISO } from "date-fns";

import { StatusBadge } from "@/features/booking/components/status-badge";
import { useActivity } from "@/features/renter/components/activity-provider";
import { getListingById } from "@/features/listings/data";
import { formatUSD } from "@/features/stays/lib/pricing";
import { useI18n } from "@/i18n/client";
import type { Stay } from "@/features/booking/types";

export function StayRow({ stay, action }: { stay: Stay; action?: React.ReactNode }) {
  const { d, t, range, lt } = useI18n();
  const listing = getListingById(stay.listingId);
  if (!listing) return null;
  const nights = differenceInCalendarDays(parseISO(stay.moveOut), parseISO(stay.moveIn));

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-foreground/25">
      <Link href={`/listing/${listing.id}`} className="flex gap-4">
        <div className="relative aspect-4/3 w-28 shrink-0 overflow-hidden rounded-xl sm:w-36">
          <Image src={listing.images[0]} alt={lt(listing).text} fill sizes="144px" className="object-cover" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1 py-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="truncate font-semibold" lang={lt(listing).lang}>
              {lt(listing).text}
            </p>
            <StatusBadge status={stay.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {t(listing.district)}, {t(listing.city)} · {d.renter.hostedBy(listing.owner.name.split(" ")[0])}
          </p>
          <p className="text-sm text-muted-foreground">
            {range(stay.moveIn, stay.moveOut)} · {d.common.nights(nights)} · {d.common.guests(stay.guests)}
          </p>
          <p className="mt-auto text-sm font-medium tabular">{d.renter.totalRent(formatUSD(stay.rentTotal))}</p>
        </div>
      </Link>
      {action && <div className="flex justify-end">{action}</div>}
    </div>
  );
}

/** Upcoming stays from the account plus booking requests sent from this browser. */
export function UpcomingStays({ stays }: { stays: Stay[] }) {
  const { d } = useI18n();
  const { requests, cancelRequest, ready } = useActivity();
  const local = ready ? requests : [];

  if (stays.length === 0 && local.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
        {d.renter.nothing}
      </p>
    );
  }

  return (
    <>
      {local.map((s) => (
        <StayRow
          key={s.id}
          stay={s}
          action={
            <button
              type="button"
              onClick={() => cancelRequest(s.id)}
              className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              {d.renter.cancelRequest}
            </button>
          }
        />
      ))}
      {stays.map((s) => (
        <StayRow key={s.id} stay={s} />
      ))}
    </>
  );
}
