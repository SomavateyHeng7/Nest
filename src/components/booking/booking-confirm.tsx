"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Listing } from "@/types/listing";

export function BookingConfirm({
  listing,
  checkIn,
  checkOut,
  guests,
  total,
}: {
  listing: Listing;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (confirmed) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <CheckCircle2 className="size-10 text-primary-sage" />
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Booking confirmed
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {name ? `${name}, you're` : "You're"} all set for {listing.title} in {listing.city}{" "}
            from {checkIn} to {checkOut}. This is a demo — no payment was actually taken.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <h2 className="font-medium text-foreground">Your details</h2>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Full name</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sokha Chan" required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <Button
          size="lg"
          className="mt-2 h-11 w-full bg-accent-terracotta text-white hover:bg-accent-terracotta/90"
          disabled={!name || !email}
          onClick={() => setConfirmed(true)}
        >
          Confirm and pay ${total}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Demo checkout — {guests} guest{guests > 1 ? "s" : ""}, no card required
        </p>
      </CardContent>
    </Card>
  );
}
