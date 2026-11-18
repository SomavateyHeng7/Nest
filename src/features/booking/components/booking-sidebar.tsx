"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarDays, ChevronDown, MessageCircle, Minus, Plus, ShieldCheck } from "lucide-react";

import { ViewingRequest } from "@/features/viewings/components/viewing-request";
import { StayCalendar } from "@/features/stays/components/stay-calendar";
import { useStayDraft } from "@/features/stays/components/stay-draft";
import { StayLengthPicker } from "@/features/stays/components/stay-length-picker";
import { useProblemText } from "@/features/stays/components/use-problem-text";
import { Button } from "@/shared/ui/button";
import { useI18n } from "@/i18n/client";
import { quoteStay } from "@/features/stays/lib/pricing";
import { serializeStay } from "@/features/stays/lib/search-params";
import { cn } from "@/shared/lib/utils";

export function BookingSidebar() {
  const router = useRouter();
  const {  d, date, money, currency, rate } = useI18n();
  const { listing, moveIn, stay, setStay, guests, setGuests, nights, moveOut, problem } = useStayDraft();
  const [pickerOpen, setPickerOpen] = useState(false);

  const quote = quoteStay(listing.pricing, nights);
  const ownerFirst = listing.owner.name.split(" ")[0];

  const problemText = useProblemText();

  function handleRequest() {
    const params = new URLSearchParams({ moveIn, stay: serializeStay(stay), guests: String(guests) });
    router.push(`/booking/${listing.id}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 lg:sticky lg:top-24">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-lg shadow-black/[0.04]">
        <div className="flex items-baseline justify-between">
          <p>
            <span className="text-2xl font-semibold tabular">{money(listing.pricing.monthly)}</span>
            <span className="text-sm text-muted-foreground"> {d.common.perMonth}</span>
          </p>
          <p className="text-sm text-muted-foreground tabular">
            {money(listing.pricing.nightly)} {d.common.perNight}
          </p>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-input">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-expanded={pickerOpen}
            aria-label={d.book.chooseMoveIn}
            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-muted/50"
          >
            <span>
              <span className="block text-xs font-semibold">{d.book.moveIn}</span>
              <span className="flex items-center gap-1.5 text-sm">
                <CalendarDays className="size-3.5 text-primary-sage" />
                {moveIn ? date(moveIn, "EEE, MMM d, yyyy") : d.book.chooseDate}
              </span>
            </span>
            <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", pickerOpen && "rotate-180")} />
          </button>
          {pickerOpen && (
            <div className="border-t border-input p-2">
              <StayCalendar
                months={1}
                onComplete={() => setPickerOpen(false)}
                className="[&_[data-slot=calendar]]:border-0 [&_[data-slot=calendar]]:p-0"
              />
              <div className="mt-2 flex items-center justify-between">
                <a
                  href="#availability"
                  className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  {d.book.seeCalendar}
                </a>
                <Button variant="outline" className="h-8 px-3" onClick={() => setPickerOpen(false)}>
                  {d.book.done}
                </Button>
              </div>
            </div>
          )}
          <div className="border-t border-input px-3 py-2.5">
            <span className="mb-1.5 block text-xs font-semibold">{d.book.stayLength}</span>
            <StayLengthPicker value={stay} onChange={setStay} compact />
          </div>
          <div className="flex items-center justify-between border-t border-input px-3 py-2.5">
            <span>
              <span className="block text-xs font-semibold">{d.book.guests}</span>
              <span className="text-sm text-muted-foreground">{d.common.upTo(listing.maxGuests)}</span>
            </span>
            <span className="flex items-center gap-2">
              <button
                type="button"
                aria-label={d.book.fewerGuests}
                disabled={guests <= 1}
                onClick={() => setGuests(guests - 1)}
                className="grid size-10 place-items-center rounded-full border border-input disabled:opacity-40 sm:size-8"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="w-4 text-center text-sm font-semibold tabular">{guests}</span>
              <button
                type="button"
                aria-label={d.book.moreGuests}
                disabled={guests >= listing.maxGuests}
                onClick={() => setGuests(guests + 1)}
                className="grid size-10 place-items-center rounded-full border border-input disabled:opacity-40 sm:size-8"
              >
                <Plus className="size-3.5" />
              </button>
            </span>
          </div>
        </div>

        {moveOut && (
          <p className="mt-2 text-xs text-muted-foreground">
            {d.book.moveOutOn(d.stay.format(stay), date(moveOut, "EEE, MMM d, yyyy"))}
          </p>
        )}

        {problem && (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm text-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
            {problemText(problem)}
          </p>
        )}

        <Button
          className="mt-4 h-12 w-full bg-accent-terracotta text-base text-white hover:bg-terracotta-strong"
          disabled={Boolean(problem)}
          onClick={handleRequest}
        >
          {d.book.request}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">{d.book.notCharged(ownerFirst)}</p>

        <dl className="mt-5 flex flex-col gap-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{d.book.rent(d.rate[quote.tier](money(quote.rate)))}</dt>
            <dd className="tabular">{money(quote.rentTotal)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{d.book.serviceFee}</dt>
            <dd className="font-medium text-success">{money(0)}</dd>
          </div>
          {quote.deposit > 0 && (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{d.book.deposit}</dt>
              <dd className="tabular">{money(quote.deposit)}</dd>
            </div>
          )}
          <div className="mt-1 flex justify-between gap-3 border-t border-border pt-3 font-semibold">
            <dt>{d.book.dueWhenAccepted}</dt>
            <dd className="tabular">{money(quote.dueAtBooking)}</dd>
          </div>
          {quote.laterPayments > 0 && (
            <p className="text-xs text-muted-foreground">
              {d.book.laterPayments(quote.laterPayments, money(listing.pricing.monthly))}
            </p>
          )}
          {currency === "KHR" && (
            <p className="text-xs text-muted-foreground">{d.prefs.currencyNote(Math.round(rate).toLocaleString("en-US"))}</p>
          )}
        </dl>
      </div>

      <ViewingRequest listing={listing} />
      <Button variant="outline" className="h-11 gap-2" nativeButton={false} render={<Link href="/messages" />}>
        <MessageCircle className="size-4" />
        {d.book.message(ownerFirst)}
      </Button>
      <p className="flex items-start gap-2 px-1 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-sage" />
        {d.book.protection}
      </p>
    </div>
  );
}
