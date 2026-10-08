"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Listing } from "@/types/listing";

const SERVICE_FEE_RATE = 0.12;
const CLEANING_FEE = 10;

function defaultDate(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function BookingSidebar({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(defaultDate(7));
  const [checkOut, setCheckOut] = useState(defaultDate(10));
  const [guests, setGuests] = useState(2);

  const nights = useMemo(() => {
    const diff = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000;
    return Math.max(1, Math.round(diff));
  }, [checkIn, checkOut]);

  const subtotal = nights * listing.pricePerNight;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee + CLEANING_FEE;

  function handleReserve() {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    });
    router.push(`/booking/${listing.id}?${params.toString()}`);
  }

  return (
    <Card className="sticky top-24 ring-foreground/10">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <p className="text-lg">
            <span className="font-semibold">${listing.pricePerNight}</span>{" "}
            <span className="text-sm text-muted-foreground">/ night</span>
          </p>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="size-3.5 fill-current text-accent-terracotta" />
            {listing.rating.toFixed(2)} · {listing.reviewCount} reviews
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-1">
          <label className="flex flex-col gap-0.5 px-2 py-1">
            <span className="text-xs font-medium text-muted-foreground">Check in</span>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="h-auto border-0 p-0 text-sm shadow-none focus-visible:ring-0"
            />
          </label>
          <label className="flex flex-col gap-0.5 border-l border-border px-2 py-1">
            <span className="text-xs font-medium text-muted-foreground">Check out</span>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="h-auto border-0 p-0 text-sm shadow-none focus-visible:ring-0"
            />
          </label>
          <label className="col-span-2 flex flex-col gap-0.5 border-t border-border px-2 py-1">
            <span className="text-xs font-medium text-muted-foreground">Guests</span>
            <Input
              type="number"
              min={1}
              max={listing.guests}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="h-auto border-0 p-0 text-sm shadow-none focus-visible:ring-0"
            />
          </label>
        </div>

        <Button
          size="lg"
          className="h-11 w-full bg-accent-terracotta text-white hover:bg-accent-terracotta/90"
          onClick={handleReserve}
        >
          Reserve
        </Button>
        <p className="text-center text-xs text-muted-foreground">You won&apos;t be charged yet</p>

        <Separator />

        <div className="flex flex-col gap-2 text-sm">
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
          <Separator />
          <div className="flex justify-between font-medium text-foreground">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
