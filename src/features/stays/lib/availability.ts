import { addDays, areIntervalsOverlapping, isAfter, parseISO } from "date-fns";

import type { Listing } from "@/features/listings/types";

export type StayProblem =
  | { kind: "min"; nights: number }
  | { kind: "max"; months: number }
  | { kind: "noDate" }
  | { kind: "early"; from: string }
  | { kind: "clash"; start: string; end: string };

/** The first booked range that a stay of `nights` from `start` runs into, if any. */
export function findClash(listing: Listing, start: Date, nights: number) {
  return listing.bookedRanges.find((r) =>
    areIntervalsOverlapping({ start, end: addDays(start, nights) }, { start: parseISO(r.start), end: parseISO(r.end) })
  );
}

/**
 * Why a stay can't be booked, or null when it can. Pure, so the listing page
 * (client) and the checkout page (server) apply the same rules.
 */
export function stayProblem(listing: Listing, moveIn: string, nights: number): StayProblem | null {
  if (nights < listing.minStayNights) return { kind: "min", nights: listing.minStayNights };
  if (nights > listing.maxStayMonths * 31) return { kind: "max", months: listing.maxStayMonths };
  if (!moveIn) return { kind: "noDate" };
  const start = parseISO(moveIn);
  if (isAfter(parseISO(listing.availableFrom), start)) return { kind: "early", from: listing.availableFrom };
  const clash = findClash(listing, start, nights);
  return clash ? { kind: "clash", start: clash.start, end: clash.end } : null;
}
