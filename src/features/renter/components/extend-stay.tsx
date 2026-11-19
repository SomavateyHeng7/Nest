"use client";

import { useState } from "react";
import { addDays, addMonths, differenceInCalendarDays, isAfter, isBefore, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { enUS, km } from "react-day-picker/locale";
import { CalendarPlus, Check, Clock } from "lucide-react";

import { useActivity } from "@/features/renter/components/activity-provider";
import { toISODate } from "@/features/stays/components/stay-draft";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Dialog } from "@/shared/ui/dialog";
import { useI18n } from "@/i18n/client";
import { quoteStay } from "@/features/stays/lib/pricing";
import type { Stay } from "@/features/booking/types";
import type { Listing } from "@/features/listings/types";

const pickerLocales = { en: enUS, km };

/**
 * "Extend stay" for an active stay: pick a later move-out day (up to the next
 * booking or the listing's maximum stay), see the extra rent, send the request.
 */
export function ExtendStay({ stay, listing }: { stay: Stay; listing: Listing }) {
  const { d, date, locale, money } = useI18n();
  const x = d.extend;
  const { extensions, requestExtension, cancelExtension, ready } = useActivity();
  const ownerFirst = listing.owner.name.split(" ")[0];

  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Date | undefined>();
  const [sent, setSent] = useState(false);

  const moveIn = parseISO(stay.moveIn);
  const currentOut = parseISO(stay.moveOut);
  const pending = ready ? extensions[stay.id] : undefined;

  // You can extend up to the next stay's first night (moving out that morning)
  // or the listing's maximum length, whichever comes first.
  const nextBooking = listing.bookedRanges
    .map((r) => parseISO(r.start))
    .filter((s) => !isBefore(s, currentOut))
    .sort((a, b) => a.getTime() - b.getTime())[0];
  const maxByLength = addMonths(moveIn, listing.maxStayMonths);
  const latest = nextBooking && isBefore(nextBooking, maxByLength) ? nextBooking : maxByLength;

  const extraNights = picked ? differenceInCalendarDays(picked, currentOut) : 0;
  const totalNights = picked ? differenceInCalendarDays(picked, moveIn) : 0;
  const extraRent = picked ? Math.max(0, quoteStay(listing.pricing, totalNights).rentTotal - stay.rentTotal) : 0;

  return (
    <>
      {/* Keep the dialog mounted after sending so its confirmation can show. */}
      {pending && !open ? (
        <span className="inline-flex h-9 items-center gap-2 rounded-lg bg-warning/10 px-3 text-sm">
          <Clock className="size-4 text-warning" />
          {x.pending(date(pending, "MMM d"))}
          <button type="button" onClick={() => cancelExtension(stay.id)} className="font-medium underline underline-offset-4">
            {x.withdraw}
          </button>
        </span>
      ) : (
        <Button
          variant="outline"
          className="h-9 gap-1.5 px-3"
          onClick={() => {
            setPicked(undefined);
            setSent(false);
            setOpen(true);
          }}
        >
          <CalendarPlus className="size-4" />
          {d.renter.extend}
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={sent ? x.sentTitle : x.title}
        description={sent ? undefined : x.sub(ownerFirst)}
        closeLabel={x.close}
      >
        {sent && picked ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-accent text-primary-sage">
              <Check className="size-6" />
            </span>
            <p className="max-w-sm text-sm text-muted-foreground">{x.sentBody(ownerFirst, date(picked, "EEE, MMM d, yyyy"))}</p>
            <Button className="mt-2 h-10 px-5" onClick={() => setOpen(false)}>
              {x.done}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-xl bg-muted/60 px-4 py-3 text-sm">
              <span className="text-muted-foreground">{x.current}</span>
              <span className="font-semibold">{date(currentOut, "EEE, MMM d, yyyy")}</span>
            </div>

            <div>
              <p className="text-sm font-semibold">{x.pick}</p>
              <p className="text-xs text-muted-foreground">
                {nextBooking && !isAfter(nextBooking, maxByLength) ? x.limit(date(nextBooking, "MMM d")) : x.noLimit}
              </p>
            </div>

            <Calendar
              mode="single"
              selected={picked}
              onSelect={(day) => setPicked(day ?? undefined)}
              defaultMonth={currentOut}
              showOutsideDays={false}
              disabled={[{ before: addDays(currentOut, 1) }, { after: latest }, { before: startOfDay(new Date()) }]}
              modifiers={{
                // Nights added, excluding the picked day itself so its selected style shows.
                extension: (day: Date) =>
                  Boolean(picked) && isBefore(day, picked!) && isWithinInterval(day, { start: currentOut, end: picked! }),
                currentOut,
              }}
              modifiersClassNames={{
                extension: "bg-accent [&>button]:!text-accent-foreground",
                currentOut: "[&>button]:ring-2 [&>button]:ring-primary-sage [&>button]:ring-inset",
              }}
              locale={pickerLocales[locale]}
              className="w-full rounded-2xl border border-border bg-card p-3 [--cell-size:--spacing(9)]"
            />

            {picked && (
              <dl className="flex flex-col gap-2 rounded-xl border border-border p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{x.newMoveOut}</dt>
                  <dd className="font-semibold">
                    {date(picked, "EEE, MMM d")} <span className="font-normal text-muted-foreground">({x.extraNights(extraNights)})</span>
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{x.extraRent}</dt>
                  <dd className="font-semibold tabular">{money(extraRent)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{x.fee}</dt>
                  <dd className="font-medium text-success">{money(0)}</dd>
                </div>
              </dl>
            )}

            <div className="sticky -bottom-5 -mx-5 -mb-5 border-t border-border bg-popover px-5 py-4">
            <Button
              className="h-12 w-full bg-cta text-base text-white hover:bg-cta-strong"
              disabled={!picked}
              onClick={() => {
                if (!picked) return;
                requestExtension(stay.id, toISODate(picked));
                setSent(true);
              }}
            >
              {picked ? x.submit(ownerFirst) : x.choose}
            </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
