import type { Metadata } from "next";

import { MAX_COMPARE } from "@/features/compare/lib/limits";
import { CompareTable } from "@/features/compare/components/compare-table";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.compare.title };
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string | string[] }> }) {
  const { ids } = await searchParams;
  // A shared link looks like /compare?ids=a,b,c; the page shows those homes instead of the visitor's own list.
  const raw = Array.isArray(ids) ? ids.join(",") : (ids ?? "");
  const sharedIds = [...new Set(raw.split(",").map((x) => x.trim()).filter(Boolean))].slice(0, MAX_COMPARE);
  return <CompareTable sharedIds={sharedIds.length > 0 ? sharedIds : undefined} />;
}
