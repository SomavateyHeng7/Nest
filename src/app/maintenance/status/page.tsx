import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getI18n } from "@/i18n/server";

export const metadata: Metadata = { title: "Error pages", robots: { index: false } };

const codes = ["404", "401", "403", "500", "503", "offline"] as const;

/** Design-review index of every error state. Remove (or protect) before launch. */
export default async function StatusIndex() {
  const { d } = await getI18n();
  const e = d.errors;
  const titleFor: Record<(typeof codes)[number], string> = {
    "404": e.notFound.title,
    "401": e.unauthorized.title,
    "403": e.forbidden.title,
    "500": e.server.title,
    "503": e.maintenance.title,
    offline: e.offline.title,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-dark-forest">{e.gallery.title}</h1>
      <p className="mt-1 text-muted-foreground">{e.gallery.sub}</p>
      <ul className="mt-8 flex flex-col gap-2">
        {codes.map((c) => (
          <li key={c}>
            <Link
              href={`/maintenance/status/${c}`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-foreground/30"
            >
              <span className="w-16 shrink-0 font-mono text-sm font-semibold text-muted-foreground">{c}</span>
              <span className="flex-1 font-medium">{titleFor[c]}</span>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/listing/this-home-was-removed"
            className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-foreground/30"
          >
            <span className="w-16 shrink-0 font-mono text-sm font-semibold text-muted-foreground">404</span>
            <span className="flex-1 font-medium">{e.listingGone.title}</span>
            <ArrowRight className="size-4 text-muted-foreground" />
          </Link>
        </li>
      </ul>
    </div>
  );
}
