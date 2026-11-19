import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CalendarCheck, MessageCircle, ShieldCheck, Wallet } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.help.eyebrow, description: d.help.lede };
}

const groupIcons = { booking: CalendarCheck, payments: Wallet, safety: ShieldCheck, owners: Building2 } as const;

export default async function HelpPage() {
  const { d } = await getI18n();
  const h = d.help;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 pb-20 sm:px-6 lg:pt-14">
      <header>
        <p className="text-sm font-semibold tracking-widest text-accent-terracotta uppercase">{h.eyebrow}</p>
        <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight text-dark-forest sm:text-5xl">{h.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{h.lede}</p>
      </header>

      <nav aria-label={h.jumpTo} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {h.groups.map((g) => {
          const Icon = groupIcons[g.id as keyof typeof groupIcons];
          return (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 text-sm font-medium transition-colors hover:border-foreground/30"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-4.5" />
              </span>
              {g.title}
            </a>
          );
        })}
      </nav>

      <div className="mt-12 flex flex-col gap-12">
        {h.groups.map((g) => (
          <section key={g.id} id={g.id} className="scroll-mt-24">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-dark-forest">{g.title}</h2>
            <div className="mt-4 flex flex-col gap-3">
              {g.faqs.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-border bg-card px-5 py-4 open:pb-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium">
                    {f.q}
                    <span aria-hidden className="text-xl leading-6 text-muted-foreground transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-14 flex flex-col gap-4 rounded-3xl bg-dark-forest p-6 text-background sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="font-heading text-2xl font-semibold">{h.stillTitle}</h2>
          <p className="mt-1 text-background/75">{h.stillBody}</p>
        </div>
        <Button
          className="h-12 shrink-0 gap-2 bg-cta px-5 text-base text-white hover:bg-cta-strong"
          nativeButton={false}
          render={<Link href="/contact" />}
        >
          <MessageCircle className="size-4.5" />
          {h.stillCta}
        </Button>
      </section>
    </div>
  );
}
