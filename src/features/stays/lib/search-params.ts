import { isValid, parseISO } from "date-fns";

import { stayToNights, type DurationUnit, type StayLength } from "@/features/stays/lib/pricing";

const UNITS: DurationUnit[] = ["days", "weeks", "months"];

/** Longest stay accepted from a URL: 12 months (the top placement-fee tier) plus slack. */
const MAX_STAY_NIGHTS = 366;

/** Parses "3-months" style values used in URLs. */
export function parseStay(value: string | undefined | null): StayLength | undefined {
  if (!value) return undefined;
  const [rawAmount, rawUnit] = value.split("-");
  const amount = Number(rawAmount);
  const unit = rawUnit as DurationUnit;
  if (!Number.isFinite(amount) || amount < 1 || !UNITS.includes(unit)) return undefined;
  const stay = { amount: Math.round(amount), unit };
  // Nothing on Nest is bookable beyond a year; huge values would overflow dates downstream.
  return stayToNights(stay) > MAX_STAY_NIGHTS ? undefined : stay;
}

export function serializeStay(stay: StayLength) {
  return `${stay.amount}-${stay.unit}`;
}

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * A calendar day from user-controlled input (e.g. `?moveIn=`). Returns the
 * value only when it is a real `yyyy-MM-dd` date, otherwise `undefined`, so
 * callers can fall back to a default instead of crashing in date-fns.
 */
export function parseISODate(value: string | undefined | null): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  return isValid(parseISO(value)) ? value : undefined;
}
