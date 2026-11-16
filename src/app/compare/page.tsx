import type { Metadata } from "next";

import { CompareTable } from "@/features/compare/components/compare-table";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.compare.title };
}

export default function ComparePage() {
  return <CompareTable />;
}
