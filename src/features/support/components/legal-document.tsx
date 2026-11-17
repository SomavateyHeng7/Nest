import Link from "next/link";
import { ChevronDown, FileText, TriangleAlert } from "lucide-react";

import type { Dictionary } from "@/i18n/dictionaries/en";

type Section = { id: string; title: string; body: string[]; list?: string[] };

/**
 * Long-form legal page: title, prototype-draft notice, a table of contents
 * (sticky sidebar on desktop, collapsible on phones) and numbered sections.
 */
export function LegalDocument({
  d,
  title,
  lede,
  updated,
  sections,
  related,
}: {
  d: Dictionary;
  title: string;
  lede: string;
  /** Already-formatted "last updated" date. */
  updated: string;
  sections: Section[];
  related: { href: string; label: string };
}) {
  const l = d.legal;

  const toc = (
    <ol className="flex flex-col gap-0.5 text-sm">
      {sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className="flex gap-2.5 rounded-lg px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span className="w-4 shrink-0 text-right tabular">{i + 1}</span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-20 sm:px-6 lg:pt-14">
      <header className="max-w-3xl">
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-dark-forest sm:text-5xl">{title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{lede}</p>
        <p className="mt-3 text-sm text-muted-foreground">{l.updated(updated)}</p>
      </header>

      <div
        role="note"
        className="mt-8 flex max-w-3xl gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3.5 text-sm"
      >
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
        <p>
          <span className="font-semibold">{l.draftTitle}.</span> <span className="text-muted-foreground">{l.draftBody}</span>
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
        <nav aria-label={l.onThisPage} className="lg:sticky lg:top-24 lg:self-start">
          {/* Phones and tablets: collapsible contents */}
          <details className="group rounded-2xl border border-border bg-card lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
              {l.onThisPage}
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-border p-2">{toc}</div>
          </details>
          {/* Desktop: always-visible sidebar */}
          <div className="hidden lg:block">
            <p className="mb-2 px-2.5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">{l.onThisPage}</p>
            {toc}
          </div>
        </nav>

        <div className="flex max-w-3xl flex-col gap-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="flex items-baseline gap-3 font-heading text-2xl font-semibold tracking-tight text-dark-forest">
                <span className="text-base text-primary-sage tabular">{i + 1}.</span>
                {s.title}
              </h2>
              <div className="mt-3 flex flex-col gap-3 text-[15px] leading-7 text-foreground/85">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
                {s.list && (
                  <ul className="flex flex-col gap-2 pl-1">
                    {s.list.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span aria-hidden className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-primary-sage" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{l.questions}</p>
              <Link href="/contact" className="text-sm text-primary-sage underline underline-offset-4 hover:text-foreground">
                {l.contactUs}
              </Link>
            </div>
            <Link
              href={related.href}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <FileText className="size-4 text-muted-foreground" />
              {l.seeAlso}: {related.label}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
