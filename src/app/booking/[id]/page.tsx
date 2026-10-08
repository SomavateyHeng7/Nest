import Image from "next/image";
import { notFound } from "next/navigation";

import { BookingConfirm } from "@/components/booking/booking-confirm";
import { getListingById } from "@/data/listings";

const SERVICE_FEE_RATE = 0.12;
const CLEANING_FEE = 10;

function defaultDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function nightsBetween(checkIn: string, checkOut: string) {
  const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000;
  return Math.max(1, Math.round(diff));
}

export default async function BookingPage(props: PageProps<"/booking/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const listing = getListingById(id);

  if (!listing) {
    notFound();
  }

  const checkIn = typeof searchParams.checkIn === "string" ? searchParams.checkIn : defaultDate(7);
  const checkOut = typeof searchParams.checkOut === "string" ? searchParams.checkOut : defaultDate(10);
  const guests = typeof searchParams.guests === "string" ? Number(searchParams.guests) : 2;

  const nights = nightsBetween(checkIn, checkOut);
  const subtotal = nights * listing.pricePerNight;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee + CLEANING_FEE;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Confirm and pay</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <BookingConfirm listing={listing} checkIn={checkIn} checkOut={checkOut} guests={guests} total={total} />

        <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
          <div className="flex gap-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-lg">
              <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{listing.title}</p>
              <p className="text-sm text-muted-foreground">
                {listing.city}, {listing.province}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Dates</span>
              <span>
                {checkIn} → {checkOut}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Guests</span>
              <span>{guests}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>
                ${listing.pricePerNight} x {nights} night{nights > 1 ? "s" : ""}
              </span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Cleaning fee</span>
              <span>${CLEANING_FEE}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Service fee</span>
              <span>${serviceFee}</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium text-foreground">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
