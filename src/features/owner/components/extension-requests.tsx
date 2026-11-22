"use client";

import { differenceInCalendarDays, parseISO } from "date-fns";
import { CalendarPlus, Check, X } from "lucide-react";

import { useActivity } from "@/features/renter/components/activity-provider";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { currentUser } from "@/features/account/current-user";
import { getListingById } from "@/features/listings/data";
import { quoteStay } from "@/features/stays/lib/pricing";
import { useI18n } from "@/i18n/client";
import type { Stay } from "@/features/booking/types";

/**
 * Extension requests from renters, waiting for the owner's answer. Prototype:
 * requests come from the renter side of this same browser (shared storage), so
 * every pending request shows here; a real build filters to the owner's listings.
 */
export function ExtensionRequests({ stays }: { stays: Stay[] }) {
  const { d, date, lt, money } = useI18n();
  const x = d.extensionOwner;
  const { extensions, decideExtension, ready } = useActivity();
  const pending = ready ? stays.filter((s) => extensions[s.id]) : [];

  if (pending.length === 0) return null;

  return (
    <section className="mt-10 min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 className="font-semibold">{x.title}</h2>
        <span className="text-sm text-muted-foreground">{x.note}</span>
      </div>
      <ul className="flex flex-col gap-3">
        {pending.map((stay) => {
          const listing = getListingById(stay.listingId);
          if (!listing) return null;
          const newOut = extensions[stay.id];
          const extraNights = differenceInCalendarDays(parseISO(newOut), parseISO(stay.moveOut));
          const extraRent = Math.max(
            0,
            quoteStay(listing.pricing, differenceInCalendarDays(parseISO(newOut), parseISO(stay.moveIn))).rentTotal - stay.rentTotal
          );
          return (
            <li key={stay.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-semibold">
                    <CalendarPlus className="size-4 text-primary-sage" aria-hidden />
                    {currentUser.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground" lang={lt(listing).lang}>
                    {lt(listing).text}
                  </p>
                  <p className="mt-1 text-sm">
                    {x.from(date(stay.moveOut, "MMM d"))} → <span className="font-medium">{x.to(date(newOut, "MMM d, yyyy"))}</span>{" "}
                    <span className="text-muted-foreground">({x.extraNights(extraNights)})</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{x.extraRent}</p>
                  <p className="font-semibold text-success tabular">{money(extraRent)}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="h-9 gap-1.5 px-3"
                  onClick={() => {
                    decideExtension(stay.id, "declined");
                    toast.info(x.declinedToast);
                  }}
                >
                  <X className="size-4" />
                  {d.owner.decline}
                </Button>
                <Button
                  className="h-9 gap-1.5 bg-cta px-3.5 text-white hover:bg-cta-strong"
                  onClick={() => {
                    decideExtension(stay.id, "approved");
                    toast.success(x.approvedToast);
                  }}
                >
                  <Check className="size-4" />
                  {d.owner.accept}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
