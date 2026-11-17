import type { Metadata } from "next";

import { LegalDocument } from "@/features/support/components/legal-document";
import { LEGAL_UPDATED } from "@/features/support/legal";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.legal.terms.title, description: d.legal.terms.lede };
}

export default async function TermsPage() {
  const { d, date } = await getI18n();
  const doc = d.legal.terms;
  return (
    <LegalDocument
      d={d}
      title={doc.title}
      lede={doc.lede}
      updated={date(LEGAL_UPDATED, "MMMM d, yyyy")}
      sections={doc.sections}
      related={{ href: "/privacy", label: d.legal.privacy.title }}
    />
  );
}
