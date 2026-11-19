import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarDays, Check, MessageCircle, Wallet } from "lucide-react";

import { FeeCalculator } from "@/features/owner/components/fee-calculator";
import { Button } from "@/shared/ui/button";
import { listings } from "@/features/listings/data";
import { getI18n } from "@/i18n/server";
import { placementFeeTiers } from "@/features/stays/lib/pricing";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.owners.eyebrow };
}

const benefitIcons = [BadgeCheck, CalendarDays, Wallet, MessageCircle];


export default async function OwnersPage() {
  const { d } = await getI18n();
  const o = d.owners;
  return (
    <div>
      <section className="mx-auto grid grid-cols-1 max-w-7xl gap-12 px-4 pt-12 pb-20 sm:px-6 lg:grid-cols-[1.1fr_minmax(0,1fr)] lg:items-center">
        <div className="flex flex-col gap-6">
          <p className="text-sm font-semibold tracking-widest text-accent-terracotta uppercase">{o.eyebrow}</p>
          <h1 className="font-heading text-5xl leading-[1.05] font-semibold tracking-tight text-dark-forest sm:text-6xl">
            {o.title}
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            {o.lede}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button className="h-12 bg-cta px-6 text-base text-white hover:bg-cta-strong" nativeButton={false} render={<Link href="/host/new" />}>
              {o.cta}
            </Button>
            <Button variant="outline" className="h-12 px-6 text-base" nativeButton={false} render={<Link href="/host" />}>
              {o.cta2}
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {o.trust.map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="size-4 text-primary-sage" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <FeeCalculator />
      </section>

      <section className="bg-card/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-dark-forest">{o.pricingTitle}</h2>
          <p className="mt-1 text-muted-foreground">{o.pricingSub}</p>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {placementFeeTiers.map((t, i) => (
              <div key={t.minMonths} className="flex flex-col rounded-3xl border border-border bg-background p-6">
                <p className="text-sm font-medium text-muted-foreground">{o.tierStays(d.fees.tierLabel(t.minMonths, t.maxMonths))}</p>
                <p className="mt-3 font-heading text-5xl font-semibold text-dark-forest tabular">{t.rate * 100}%</p>
                <p className="mt-1 text-sm text-muted-foreground">{o.ofMonthOnce}</p>
                <p className="mt-6 border-t border-border pt-4 text-sm">
                  {o.tierFor[i]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid grid-cols-1 max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image src={listings[3].images[0]} alt={o.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-dark-forest">{o.toolsTitle}</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {o.benefits.map(({ title, body }, i) => {
              const Icon = benefitIcons[i];
              return (
              <div key={title}>
                <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <h2 className="text-center font-heading text-3xl font-semibold tracking-tight text-dark-forest">{o.faqTitle}</h2>
        <div className="mt-8 flex flex-col gap-3">
          {o.faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-card px-5 py-4 open:pb-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {f.q}
                <span className="text-xl text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
