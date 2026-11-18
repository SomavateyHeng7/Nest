export type PropertyType = "condo" | "apartment" | "service-apartment" | "room" | "house";

export interface Owner {
  id: string;
  name: string;
  avatarUrl: string;
  joinedYear: number;
  identityVerified: boolean;
  responseRate: number;
  responseTime: string;
  languages: string[];
}

export interface Verification {
  identity: boolean;
  ownership: boolean;
  inPersonVisit: boolean;
  photosMatch: boolean;
  verifiedOn: string;
}

export interface Pricing {
  /** USD per night, for stays under a week */
  nightly: number;
  /** USD per week, for stays of 1–3 weeks */
  weekly: number;
  /** USD per month, for stays of a month or longer */
  monthly: number;
  /** Refundable deposit, typically one month for long stays */
  deposit: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface Listing {
  id: string;
  /** Owner-written title in English (always present). */
  title: string;
  /** Optional Khmer title written by the owner. */
  titleKm?: string;
  type: PropertyType;
  city: string;
  district: string;
  nearby: string[];
  /**
   * Approximate map point for the area (WGS84). Never the exact address: the
   * backend should return a point offset by a few hundred metres, and the exact
   * address is shared only after a booking is confirmed.
   */
  location: LatLng;
  pricing: Pricing;
  minStayNights: number;
  maxStayMonths: number;
  availableFrom: string;
  bookedRanges: DateRange[];
  bedrooms: number;
  baths: number;
  sizeSqm: number;
  maxGuests: number;
  furnished: boolean;
  utilitiesIncluded: string[];
  electricity: string;
  amenities: string[];
  houseRules: string[];
  description: string;
  /** Optional Khmer description written by the owner. */
  descriptionKm?: string;
  images: string[];
  owner: Owner;
  verification: Verification;
}
