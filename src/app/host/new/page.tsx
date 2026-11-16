import type { Metadata } from "next";

import { ListingWizard } from "@/components/dashboard/listing-wizard";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.wizard.eyebrow };
}

export default async function NewListingPage() {
  const { d } = await getI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-24 sm:px-6">
      <p className="text-xs font-semibold tracking-wider text-accent-terracotta uppercase">{d.wizard.eyebrow}</p>
      <h1 className="mt-1 mb-8 font-heading text-3xl font-semibold tracking-tight text-dark-forest">{d.wizard.title}</h1>
      <ListingWizard />
    </div>
  );
}
