import { differenceInCalendarMonths, parseISO } from "date-fns";

import type { Pricing } from "@/features/listings/types";

export type DurationUnit = "days" | "weeks" | "months";

export interface StayLength {
  amount: number;
  unit: DurationUnit;
}

export const DAYS_PER_MONTH = 30;

export function stayToNights({ amount, unit }: StayLength) {
  if (unit === "days") return amount;
  if (unit === "weeks") return amount * 7;
  return amount * DAYS_PER_MONTH;
}

/**
 * Express a number of nights in the most natural unit: whole months (30 nights),
 * whole weeks under a month, otherwise days. Used when a renter picks move-in
 * and move-out days directly on the calendar.
 */
export function nightsToStay(nights: number): StayLength {
  const n = Math.max(1, Math.round(nights));
  if (n >= DAYS_PER_MONTH && n % DAYS_PER_MONTH === 0) return { amount: n / DAYS_PER_MONTH, unit: "months" };
  if (n < 28 && n % 7 === 0) return { amount: n / 7, unit: "weeks" };
  return { amount: n, unit: "days" };
}

export function formatUSD(value: number, opts: { cents?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: opts.cents ? 2 : 0,
    minimumFractionDigits: opts.cents ? 2 : 0,
  }).format(value);
}

export type RateTier = "nightly" | "weekly" | "monthly";

export interface StayQuote {
  nights: number;
  tier: RateTier;
  /** The per-unit rate the renter is charged under (per night, week or month, by `tier`) */
  rate: number;
  /** Rent for the whole stay */
  rentTotal: number;
  /** What the renter pays at booking (first month, or the full stay if shorter) */
  dueAtBooking: number;
  deposit: number;
  /** Renters never pay Nest fees */
  renterFee: 0;
  /** Number of monthly instalments after the first, for long stays */
  laterPayments: number;
}

/** Shortest stay each tier's rate applies to. */
const TIER_MIN_NIGHTS: Record<RateTier, number> = { nightly: 1, weekly: 7, monthly: 28 };

/** Rent for `nights` under one tier, prorated by day. */
function tierRent(pricing: Pricing, tier: RateTier, nights: number) {
  if (tier === "monthly") return Math.round((pricing.monthly / DAYS_PER_MONTH) * nights);
  if (tier === "weekly") return Math.round((pricing.weekly / 7) * nights);
  return pricing.nightly * nights;
}

/**
 * Refundable deposit by length of stay: none under a week, half for 1–3 weeks,
 * the full deposit from four weeks. It follows the stay length, not the
 * rate charged, so a cheaper rate never adds a deposit.
 */
function depositFor(pricing: Pricing, nights: number) {
  if (nights >= TIER_MIN_NIGHTS.monthly) return pricing.deposit;
  if (nights >= TIER_MIN_NIGHTS.weekly) return Math.round(pricing.deposit / 2);
  return 0;
}

/**
 * Quotes the cheapest rent for a stay, so a shorter stay never costs more
 * than a longer one. Each tier is tried, and a tier the stay is too short
 * for is charged as its minimum length (e.g. 6 nights can cost the same as
 * the 1-week price, 27 nights the same as 4 weeks at the monthly rate).
 */
export function quoteStay(pricing: Pricing, nights: number): StayQuote {
  const safeNights = Math.max(1, Math.round(nights));

  const tiers: RateTier[] = ["nightly", "weekly", "monthly"];
  const best = tiers
    .map((tier) => ({ tier, rent: tierRent(pricing, tier, Math.max(safeNights, TIER_MIN_NIGHTS[tier])) }))
    // On a tie prefer the longer tier, whose rate is what the renter will recognise.
    .reduce((a, b) => (b.rent <= a.rent ? b : a));

  const rentTotal = best.rent;
  const deposit = depositFor(pricing, safeNights);
  // Stays of four weeks or more are paid month by month whichever rate wins, so
  // a cheap weekly rate on a long stay never puts the whole rent up front.
  const isLong = safeNights >= TIER_MIN_NIGHTS.monthly;
  const instalments = isLong ? Math.max(1, Math.ceil(safeNights / DAYS_PER_MONTH)) : 1;
  const perMonth = Math.round((rentTotal / safeNights) * DAYS_PER_MONTH);
  const firstPayment = isLong ? Math.min(rentTotal, perMonth) : rentTotal;

  return {
    nights: safeNights,
    tier: best.tier,
    rate: pricing[best.tier],
    rentTotal,
    dueAtBooking: firstPayment + deposit,
    deposit,
    renterFee: 0,
    laterPayments: instalments - 1,
  };
}

/**
 * The rent instalment due on `dueDate` for a monthly stay: one month's rent,
 * or whatever is left of the total for the final, shorter month. The first
 * month is paid at booking, then one instalment per calendar month after move-in.
 */
export function nextRentAmount(stay: { moveIn: string; monthlyRent: number; rentTotal: number }, dueDate: string) {
  const paidMonths = Math.max(1, differenceInCalendarMonths(parseISO(dueDate), parseISO(stay.moveIn)));
  const remaining = stay.rentTotal - stay.monthlyRent * paidMonths;
  return Math.max(0, Math.min(stay.monthlyRent, remaining));
}

export interface PlacementFeeTier {
  minMonths: number;
  maxMonths: number;
  rate: number;
}

/**
 * Owner placement fee, charged once per completed booking and deducted from
 * the first month's rent. No recurring commission.
 */
export const placementFeeTiers: PlacementFeeTier[] = [
  { minMonths: 1, maxMonths: 3, rate: 0.5 },
  { minMonths: 4, maxMonths: 6, rate: 0.75 },
  { minMonths: 7, maxMonths: 12, rate: 1 },
];

export function placementFeeTier(months: number) {
  // Calendar months vary (28–31 days), so a "3 month" stay can be 92 nights.
  // Round to the nearest whole month rather than up, so it stays in the 1–3 tier.
  const rounded = Math.max(1, Math.round(months));
  return (
    placementFeeTiers.find((t) => rounded >= t.minMonths && rounded <= t.maxMonths) ??
    placementFeeTiers[placementFeeTiers.length - 1]
  );
}

/**
 * NOTE: the pitch defines tiers from one month upward. For stays under a month
 * we apply the first tier (50%) to the rent actually paid — placeholder until
 * the team confirms short-stay pricing.
 */
export function placementFee(monthlyRent: number, nights: number, rentTotal: number) {
  const months = nights / DAYS_PER_MONTH;
  const tier = placementFeeTier(months);
  const base = nights < 28 ? rentTotal : monthlyRent;
  return { tier, fee: Math.round(base * tier.rate) };
}
