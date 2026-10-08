"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ANYWHERE, destinations } from "@/lib/destinations";

export function HeroSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState(destinations[0]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (destination !== ANYWHERE) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests > 1) params.set("guests", String(guests));

    const query = params.toString();
    router.push(query ? `/listing?${query}` : "/listing");
  }

  return (
    <form
      className="flex w-full max-w-3xl flex-col gap-2 rounded-2xl bg-surface-white p-2 shadow-lg ring-1 ring-black/5 sm:flex-row sm:items-center dark:bg-card"
      onSubmit={handleSubmit}
    >
      <label className="flex flex-1 flex-col gap-0.5 px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">Where</span>
        <select
          className="bg-transparent text-sm text-foreground outline-none"
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
        >
          {destinations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <div className="hidden h-8 w-px bg-border sm:block" />

      <label className="flex flex-1 flex-col gap-0.5 px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">Check in</span>
        <Input
          type="date"
          className="h-auto border-0 p-0 text-sm shadow-none focus-visible:ring-0"
          value={checkIn}
          onChange={(event) => setCheckIn(event.target.value)}
        />
      </label>

      <div className="hidden h-8 w-px bg-border sm:block" />

      <label className="flex flex-1 flex-col gap-0.5 px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">Check out</span>
        <Input
          type="date"
          className="h-auto border-0 p-0 text-sm shadow-none focus-visible:ring-0"
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
        />
      </label>

      <div className="hidden h-8 w-px bg-border sm:block" />

      <label className="flex flex-1 flex-col gap-0.5 px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">Guests</span>
        <Input
          type="number"
          min={1}
          value={guests}
          onChange={(event) => setGuests(Math.max(1, Number(event.target.value) || 1))}
          className="h-auto border-0 p-0 text-sm shadow-none focus-visible:ring-0"
        />
      </label>

      <Button
        type="submit"
        className="h-11 w-full shrink-0 gap-2 rounded-xl bg-accent-terracotta px-5 text-white hover:bg-accent-terracotta/90 sm:w-auto"
      >
        <Search className="size-4" />
        Search
      </Button>
    </form>
  );
}
