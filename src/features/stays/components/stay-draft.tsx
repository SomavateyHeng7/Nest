"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { addDays, format, parseISO, subDays } from "date-fns";

import { stayProblem, type StayProblem } from "@/features/stays/lib/availability";
import { stayToNights, type StayLength } from "@/features/stays/lib/pricing";
import type { Listing } from "@/features/listings/types";

export type { StayProblem };

interface StayDraft {
  listing: Listing;
  moveIn: string;
  setMoveIn: (iso: string) => void;
  stay: StayLength;
  setStay: (stay: StayLength) => void;
  guests: number;
  setGuests: (n: number) => void;
  nights: number;
  /** Day the renter leaves (checkout morning). */
  moveOut: Date | null;
  /** Last night actually slept — the end of the highlighted range. */
  lastNight: Date | null;
  problem: StayProblem | null;
}

const StayDraftContext = createContext<StayDraft | null>(null);

/** Longest common stay that fits the calendar from the first available day. */
function defaultStay(listing: Listing): StayLength {
  const candidates: StayLength[] = [
    { amount: 3, unit: "months" },
    { amount: 1, unit: "months" },
    { amount: 2, unit: "weeks" },
    { amount: Math.max(listing.minStayNights, 3), unit: "days" },
  ];
  return candidates.find((c) => stayProblem(listing, listing.availableFrom, stayToNights(c)) === null) ?? candidates[0];
}

/**
 * Shared booking draft for a listing page, so the booking card and the
 * availability calendar edit the same move-in date and stay length.
 */
export function StayDraftProvider({
  listing,
  initial,
  children,
}: {
  listing: Listing;
  /** Start from known values (e.g. the checkout page's URL) instead of defaults. */
  initial?: { moveIn: string; stay: StayLength; guests: number };
  children: React.ReactNode;
}) {
  const [moveIn, setMoveIn] = useState(initial?.moveIn ?? listing.availableFrom);
  const [stay, setStay] = useState<StayLength>(() => initial?.stay ?? defaultStay(listing));
  const [guests, setGuests] = useState(initial?.guests ?? 1);

  const value = useMemo<StayDraft>(() => {
    const nights = stayToNights(stay);
    const start = moveIn ? parseISO(moveIn) : null;
    const moveOut = start ? addDays(start, nights) : null;
    const lastNight = moveOut ? subDays(moveOut, 1) : null;

    const problem = stayProblem(listing, moveIn, nights);

    return { listing, moveIn, setMoveIn, stay, setStay, guests, setGuests, nights, moveOut, lastNight, problem };
  }, [listing, moveIn, stay, guests]);

  return <StayDraftContext.Provider value={value}>{children}</StayDraftContext.Provider>;
}

export function useStayDraft() {
  const ctx = useContext(StayDraftContext);
  if (!ctx) throw new Error("useStayDraft must be used inside StayDraftProvider");
  return ctx;
}

export const toISODate = (d: Date) => format(d, "yyyy-MM-dd");
