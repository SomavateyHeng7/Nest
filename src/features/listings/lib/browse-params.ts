import { ANYWHERE, areas, cities, propertyTypes } from "@/features/listings/lib/destinations";
import { firstParam, parseISODate, parseStay, serializeStay } from "@/features/stays/lib/search-params";
import type { StayLength } from "@/features/stays/lib/pricing";
import type { PropertyType } from "@/features/listings/types";

export interface BrowserFilters {
  city: string;
  district: string;
  moveIn: string;
  stay: StayLength;
  types: PropertyType[];
  maxMonthly: number;
  minBedrooms: number;
  billsIncluded: boolean;
  fullyVerifiedOnly: boolean;
  furnishedOnly: boolean;
  /** Lowest guest rating to show; 0 means any. */
  minRating: number;
}

export const SORTS = ["recommended", "price-asc", "price-desc", "available", "rating"] as const;
export type Sort = (typeof SORTS)[number];

export type BrowseView = "list" | "map";

export const RATING_STEPS = [0, 4, 4.5] as const;

export const BUDGET_MIN = 150;
export const BUDGET_MAX = 1500;
const DEFAULT_STAY: StayLength = { amount: 1, unit: "months" };

type Params = Record<string, string | string[] | undefined>;

/**
 * Reads search filters from the URL. Every value is user-editable, so anything
 * unknown or out of range falls back to the default instead of erroring.
 */
export function parseBrowseParams(params: Params): { filters: BrowserFilters; sort: Sort; view: BrowseView } {
  const city = firstParam(params.city);
  const validCity = city && cities.includes(city) ? city : ANYWHERE;
  const district = firstParam(params.district) ?? "";
  const types = (firstParam(params.type) ?? "")
    .split(",")
    .filter((x): x is PropertyType => propertyTypes.includes(x as PropertyType));
  const max = Number(firstParam(params.max));
  const beds = Number(firstParam(params.beds));
  const rating = Number(firstParam(params.rating));
  const sort = firstParam(params.sort) as Sort | undefined;

  return {
    filters: {
      city: validCity,
      district: areas.find((a) => a.city === validCity)?.districts.includes(district) ? district : "",
      moveIn: parseISODate(firstParam(params.moveIn)) ?? "",
      stay: parseStay(firstParam(params.stay)) ?? DEFAULT_STAY,
      types,
      maxMonthly: Number.isFinite(max) && max >= BUDGET_MIN && max < BUDGET_MAX ? Math.round(max) : BUDGET_MAX,
      minBedrooms: Number.isInteger(beds) && beds >= 0 && beds <= 3 ? beds : 0,
      billsIncluded: firstParam(params.bills) === "1",
      fullyVerifiedOnly: firstParam(params.visited) === "1",
      furnishedOnly: firstParam(params.furnished) === "1",
      minRating: (RATING_STEPS as readonly number[]).includes(rating) ? rating : 0,
    },
    sort: sort && SORTS.includes(sort) ? sort : "recommended",
    view: firstParam(params.view) === "map" ? "map" : "list",
  };
}

/** The query string for a search, leaving out anything at its default so links stay short. */
export function serializeBrowseParams(f: BrowserFilters, sort: Sort, view: BrowseView) {
  const q = new URLSearchParams();
  if (f.city !== ANYWHERE) q.set("city", f.city);
  if (f.district) q.set("district", f.district);
  if (f.moveIn) q.set("moveIn", f.moveIn);
  const stay = serializeStay(f.stay);
  if (stay !== serializeStay(DEFAULT_STAY)) q.set("stay", stay);
  if (f.types.length) q.set("type", f.types.join(","));
  if (f.maxMonthly < BUDGET_MAX) q.set("max", String(f.maxMonthly));
  if (f.minBedrooms > 0) q.set("beds", String(f.minBedrooms));
  if (f.billsIncluded) q.set("bills", "1");
  if (f.fullyVerifiedOnly) q.set("visited", "1");
  if (f.furnishedOnly) q.set("furnished", "1");
  if (f.minRating > 0) q.set("rating", String(f.minRating));
  if (sort !== "recommended") q.set("sort", sort);
  if (view === "map") q.set("view", "map");
  return q.toString();
}
