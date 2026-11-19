import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CalendarDays, MapPin, ShieldCheck, Wallet } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { listings } from "@/features/listings/data";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.about.eyebrow, description: d.about.lede };
}

const valueIcons = [BadgeCheck, Wallet, CalendarDays, ShieldCheck];

export default async function AboutPage() {
  const { d, t } = await getI18n();
  const a = d.about;

  return (
    <div>
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.1fr_minmax(0,1fr)] lg:items-center lg:pt-16 lg:pb-24">
        <div className="flex flex-col gap-5">
          <p className="text-sm font-semibold tracking-widest text-accent-terracotta uppercase">{a.eyebrow}</p>
          <h1 className="font-heading text-4xl leading-[1.08] font-semibold tracking-tight text-dark-forest sm:text-6xl">{a.title}</h1>
          <p className="max-w-xl text-lg text-muted-foreground">{a.lede}</p>
        </div>
        <div className="relative aspect-4/3 overflow-hidden rounded-3xl">
          <Image src={listings[0].images[0]} alt={a.imageAlt} fill preload sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section className="bg-card/70 py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-dark-forest">{a.storyTitle}</h2>
          <div className="flex flex-col gap-4 text-lg leading-8 text-foreground/85">
            {a.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-dark-forest">{a.valuesTitle}</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {a.values.map(({ title, body }, i) => {
            const Icon = valueIcons[i];
            return (
              <div key={title} className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <p className="font-semibold">{title}</p>
                <p className="text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="grid grid-cols-1 gap-8 rounded-3xl bg-dark-forest p-6 text-background sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-heading text-3xl font-semibold">{a.whereTitle}</h2>
            <p className="mt-3 text-background/75">{a.whereBody}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {["Phnom Penh", "Siem Reap", "Kampot"].map((city) => (
                <li key={city}>
                  <Link
                    href={`/listing?city=${encodeURIComponent(city)}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-background/10 px-3.5 py-2 text-sm font-medium hover:bg-background/20"
                  >
                    <MapPin className="size-3.5" />
                    {t(city)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <p className="font-heading text-2xl font-semibold lg:text-right">{a.ctaTitle}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 bg-cta px-6 text-base text-white hover:bg-cta-strong"
                nativeButton={false}
                render={<Link href="/listing" />}
              >
                {a.ctaRenter}
              </Button>
              <Button
                variant="outline"
                className="h-12 border-background/30 bg-transparent px-6 text-base text-background hover:bg-background/10 hover:text-background"
                nativeButton={false}
                render={<Link href="/owners" />}
              >
                {a.ctaOwner}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
