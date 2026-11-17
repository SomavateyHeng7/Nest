import type { Metadata } from "next";

import { LegalDocument } from "@/features/support/components/legal-document";
import { LEGAL_UPDATED } from "@/features/support/legal";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.legal.privacy.title, description: d.legal.privacy.lede };
}

export default async function PrivacyPage() {
  const { d, date } = await getI18n();
  const doc = d.legal.privacy;
  return (
    <LegalDocument
      d={d}
      title={doc.title}
      lede={doc.lede}
      updated={date(LEGAL_UPDATED, "MMMM d, yyyy")}
      sections={doc.sections}
      related={{ href: "/terms", label: d.legal.terms.title }}
    />
  );
}
