import type { PropertyType } from "@/features/listings/types";

export const ANYWHERE = "Anywhere";

export const areas = [
  { city: "Phnom Penh", districts: ["BKK1", "Toul Kork", "Daun Penh", "Tonle Bassac", "Chroy Changvar", "Sen Sok"] },
  { city: "Siem Reap", districts: ["Wat Bo", "Sala Kamreuk"] },
  { city: "Sihanoukville", districts: ["Otres"] },
  { city: "Kampot", districts: ["Riverside"] },
];

export const cities = areas.map((a) => a.city);

export const propertyTypes: PropertyType[] = ["condo", "apartment", "service-apartment", "room", "house"];
