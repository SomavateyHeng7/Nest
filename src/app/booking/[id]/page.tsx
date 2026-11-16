import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { addDays, parseISO } from "date-fns";
import { BadgeCheck, ChevronLeft } from "lucide-react";

import { BookingConfirm } from "@/components/booking/booking-confirm";
import { CheckoutDates } from "@/components/booking/checkout-dates";
import { getListingById, isFullyVerified } from "@/data/listings";
import { getI18n } from "@/i18n/server";
import { formatUSD, quoteStay, stayToNights } from "@/lib/pricing";
import { firstParam, parseStay } from "@/lib/search-params";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.checkout.title };
}

export default async function BookingPage(props: PageProps<"/booking/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const listing = getListingById(id);
  if (!listing) notFound();

  const { d, t, date, lt } = await getI18n();
  const c = d.checkout;

  const moveIn = firstParam(searchParams.moveIn) ?? listing.availableFrom;
  const stay = parseStay(firstParam(searchParams.stay)) ?? { amount: 1, unit: "months" as const };
  const guests = Math.max(1, Number(firstParam(searchParams.guests)) || 1);

  const nights = stayToNights(stay);
  const quote = quoteStay(listing.pricing, nights);
  const moveOut = addDays(parseISO(moveIn), nights);
  const ownerFirstName = listing.owner.name.split(" ")[0];
  const rateLabel = d.rate[quote.tier](formatUSD(quote.rate));
  const firstRent = quote.dueAtBooking - quote.deposit;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-24 sm:px-6">
      <Link
        href={`/listing/${listing.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {c.backToListing}
      </Link>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-dark-forest">{c.title}</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        <BookingConfirm ownerFirstName={ownerFirstName} listingTitle={lt(listing).text} dueAtBooking={quote.dueAtBooking} />

        <aside className="h-fit rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <div className="flex gap-4">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
              <Image src={listing.images[0]} alt={lt(listing).text} fill sizes="96px" className="object-cover" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm leading-snug font-semibold" lang={lt(listing).lang}>
                {lt(listing).text}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(listing.district)}, {t(listing.city)}
              </p>
              {isFullyVerified(listing) && (
                <span className="flex items-center gap-1 text-xs font-semibold text-dark-forest">
                  <BadgeCheck className="size-3.5 text-primary-sage" />
                  {d.verified.full}
                </span>
              )}
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-5 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">{d.book.moveIn}</dt>
              <dd className="font-medium">{date(moveIn, "EEE, MMM d, yyyy")}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{c.moveOut}</dt>
              <dd className="font-medium">{date(moveOut, "EEE, MMM d, yyyy")}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{c.length}</dt>
              <dd className="font-medium">{d.stay.format(stay)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{c.guests}</dt>
              <dd className="font-medium">{guests}</dd>
            </div>
          </dl>
          <CheckoutDates listing={listing} moveIn={moveIn} stay={stay} guests={guests} />

          <dl className="mt-5 flex flex-col gap-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{c.rentWith(rateLabel)}</dt>
              <dd className="tabular">{formatUSD(quote.rentTotal)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">{d.book.serviceFee}</dt>
              <dd className="font-medium text-success">$0</dd>
            </div>
            {quote.deposit > 0 && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{d.book.deposit}</dt>
                <dd className="tabular">{formatUSD(quote.deposit)}</dd>
              </div>
            )}
            <div className="mt-2 flex justify-between gap-3 border-t border-border pt-3 text-base font-semibold">
              <dt>{d.book.dueWhenAccepted}</dt>
              <dd className="tabular">{formatUSD(quote.dueAtBooking)}</dd>
            </div>
            {quote.laterPayments > 0 && firstRent < quote.rentTotal && (
              <p className="text-xs text-muted-foreground">
                {c.remaining(formatUSD(quote.rentTotal - firstRent), quote.laterPayments)}
              </p>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}
