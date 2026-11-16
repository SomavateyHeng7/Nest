import type { DurationUnit, StayLength } from "@/lib/pricing";

const UNITS: DurationUnit[] = ["days", "weeks", "months"];

/** Parses "3-months" style values used in URLs. */
export function parseStay(value: string | undefined | null): StayLength | undefined {
  if (!value) return undefined;
  const [rawAmount, rawUnit] = value.split("-");
  const amount = Number(rawAmount);
  const unit = rawUnit as DurationUnit;
  if (!Number.isFinite(amount) || amount < 1 || !UNITS.includes(unit)) return undefined;
  return { amount: Math.round(amount), unit };
}

export function serializeStay(stay: StayLength) {
  return `${stay.amount}-${stay.unit}`;
}

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
