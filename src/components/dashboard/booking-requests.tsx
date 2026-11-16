"use client";

import { useState } from "react";
import Link from "next/link";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { BadgeCheck, Check, MessageCircle, X } from "lucide-react";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getListingById } from "@/data/listings";
import { useI18n } from "@/i18n/client";
import { formatUSD, placementFee } from "@/lib/pricing";
import type { BookingStatus, OwnerBooking } from "@/types/dashboard";

export function BookingRequests({ bookings }: { bookings: OwnerBooking[] }) {
  const { d, range, relative, lt } = useI18n();
  const [statuses, setStatuses] = useState<Record<string, BookingStatus>>(
    Object.fromEntries(bookings.map((b) => [b.id, b.status]))
  );

  return (
    <div className="flex flex-col gap-3">
      {bookings.map((b) => {
        const listing = getListingById(b.listingId);
        if (!listing) return null;
        const status = statuses[b.id];
        const nights = differenceInCalendarDays(parseISO(b.moveOut), parseISO(b.moveIn));
        const { fee, tier } = placementFee(b.firstMonthRent, nights, b.rentTotal);

        return (
          <article key={b.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start gap-3">
              <Avatar size="lg">
                <AvatarImage src={b.renterAvatarUrl} alt={b.renterName} />
                <AvatarFallback>{b.renterName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{b.renterName}</p>
                  {b.renterVerified && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <BadgeCheck className="size-3.5 text-primary-sage" />
                      {d.owner.idVerified}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span lang={lt(listing).lang}>{lt(listing).text}</span> · {range(b.moveIn, b.moveOut)} ·{" "}
                  {nights >= 28 ? d.common.monthsShort(Math.round(nights / 30)) : d.common.nights(nights)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={status} />
                <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                  {relative(b.requestedAt)}
                </span>
              </div>
            </div>

            {b.renterNote && status === "pending" && (
              <p className="mt-3 rounded-xl bg-muted/70 px-4 py-3 text-sm">“{b.renterNote}”</p>
            )}

            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">{d.owner.totalRent}</dt>
                  <dd className="font-semibold tabular">{formatUSD(b.rentTotal)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{d.owner.placementFee(tier.rate * 100)}</dt>
                  <dd className="tabular">−{formatUSD(fee)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">{d.owner.youReceive}</dt>
                  <dd className="font-semibold text-success tabular">{formatUSD(b.rentTotal - fee)}</dd>
                </div>
              </dl>
              {status === "pending" && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon-lg" aria-label={d.owner.messageRenter} nativeButton={false} render={<Link href="/messages" />}>
                    <MessageCircle className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 gap-1.5 px-3"
                    onClick={() => setStatuses((s) => ({ ...s, [b.id]: "declined" }))}
                  >
                    <X className="size-4" />
                    {d.owner.decline}
                  </Button>
                  <Button
                    className="h-9 gap-1.5 bg-accent-terracotta px-3.5 text-white hover:bg-terracotta-strong"
                    onClick={() => setStatuses((s) => ({ ...s, [b.id]: "confirmed" }))}
                  >
                    <Check className="size-4" />
                    {d.owner.accept}
                  </Button>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
