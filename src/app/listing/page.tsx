import type { Metadata } from "next";
import { connection } from "next/server";

import { ListingBrowser } from "@/features/listings/components/listing-browser";
import { RecentlyViewed } from "@/features/listings/components/recently-viewed";
import { listings } from "@/features/listings/data";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.nav.findStay };
}

export default async function ListingsPage() {
  // Render per request so the results in the first HTML match the search in the
  // URL, which the browser reads (and keeps in sync) itself.
  await connection();
  return (
    <>
      <ListingBrowser listings={listings} />
      <RecentlyViewed className="mx-auto max-w-7xl px-4 pb-20 sm:px-6" />
    </>
  );
}
