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

/**
 * Picks the cheapest applicable rate tier for the length of stay.
 * Short stays use the nightly rate, 1–3 weeks the weekly rate, and a month or
 * longer the monthly rate (prorated by day after the first month).
 */
export function quoteStay(pricing: Pricing, nights: number): StayQuote {
  const safeNights = Math.max(1, Math.round(nights));

  if (safeNights >= 28) {
    const months = safeNights / DAYS_PER_MONTH;
    const rentTotal = Math.round(pricing.monthly * months);
    const firstPayment = Math.min(rentTotal, pricing.monthly);
    return {
      nights: safeNights,
      tier: "monthly",
      rate: pricing.monthly,
      rentTotal,
      dueAtBooking: firstPayment + pricing.deposit,
      deposit: pricing.deposit,
      renterFee: 0,
      laterPayments: Math.max(0, Math.ceil(months) - 1),
    };
  }

  if (safeNights >= 7) {
    const rentTotal = Math.round((pricing.weekly / 7) * safeNights);
    const deposit = Math.round(pricing.deposit / 2);
    return {
      nights: safeNights,
      tier: "weekly",
      rate: pricing.weekly,
      rentTotal,
      dueAtBooking: rentTotal + deposit,
      deposit,
      renterFee: 0,
      laterPayments: 0,
    };
  }

  const rentTotal = pricing.nightly * safeNights;
  return {
    nights: safeNights,
    tier: "nightly",
    rate: pricing.nightly,
    rentTotal,
    dueAtBooking: rentTotal,
    deposit: 0,
    renterFee: 0,
    laterPayments: 0,
  };
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
