import type { Metadata } from "next";

import { ListingBrowser, type BrowserFilters } from "@/components/listing/listing-browser";
import { listings } from "@/data/listings";
import { getI18n } from "@/i18n/server";
import { ANYWHERE, cities, propertyTypes } from "@/lib/destinations";
import { firstParam, parseStay } from "@/lib/search-params";
import type { PropertyType } from "@/types/listing";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.nav.findStay };
}

export default async function ListingsPage(props: PageProps<"/listing">) {
  const params = await props.searchParams;

  const city = firstParam(params.city);
  const type = firstParam(params.type) as PropertyType | undefined;

  const initial: BrowserFilters = {
    city: city && cities.includes(city) ? city : ANYWHERE,
    district: "",
    moveIn: firstParam(params.moveIn) ?? "",
    stay: parseStay(firstParam(params.stay)) ?? { amount: 1, unit: "months" },
    types: type && propertyTypes.includes(type) ? [type] : [],
    maxMonthly: 1500,
    minBedrooms: 0,
    billsIncluded: false,
    fullyVerifiedOnly: false,
    furnishedOnly: false,
  };

  // Keyed on the query so a new search from the navbar/hero resets filter state.
  const key = JSON.stringify(params);

  return <ListingBrowser key={key} listings={listings} initial={initial} />;
}
