import type { MonthlyIncome } from "@/features/owner/types";

/** Listings the demo account manages as an owner. */
export const ownerListingIds = ["bkk1-garden-condo", "chroy-changvar-view-condo", "bassac-service-apartment"];

export const ownerListingStatus: Record<string, "live" | "paused" | "in-review"> = {
  "bkk1-garden-condo": "live",
  "chroy-changvar-view-condo": "in-review",
  "bassac-service-apartment": "live",
};

export const monthlyIncome: MonthlyIncome[] = [
  { month: "2026-06", rent: 650, fees: 488 },
  { month: "2026-07", rent: 650, fees: 0 },
  { month: "2026-08", rent: 1225, fees: 575 },
  { month: "2026-09", rent: 1800, fees: 0 },
  { month: "2026-10", rent: 1800, fees: 0 },
  { month: "2026-11", rent: 1150, fees: 0 },
];
