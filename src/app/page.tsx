import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  Camera,
  Check,
  FileCheck2,
  GraduationCap,
  Home as HomeIcon,
  Luggage,
  MessageCircle,
  Minus,
  Search,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { HeroSearch } from "@/features/listings/components/hero-search";
import { ListingCard } from "@/features/listings/components/listing-card";
import { Button } from "@/shared/ui/button";
import { listings } from "@/features/listings/data";
import { getI18n } from "@/i18n/server";

const segmentMeta = [
  { icon: Luggage, href: "/listing?stay=10-days" },
  { icon: GraduationCap, href: "/listing?stay=4-months&type=room" },
  { icon: Briefcase, href: "/listing?stay=3-months&city=Phnom+Penh" },
  { icon: Users, href: "/listing?stay=6-months&type=house" },
];

const checkIcons = [UserCheck, FileCheck2, Camera, CalendarCheck];
const stepIcons = [Search, BadgeCheck, MessageCircle];

type Mark = "yes" | "no" | "partial";

// Columns: Nest, Facebook groups, agents, hotel platforms — row labels live in the dictionary.
const comparison: Mark[][] = [
  ["yes", "no", "partial", "partial"],
  ["yes", "no", "no", "yes"],
  ["yes", "no", "partial", "yes"],
  ["yes", "yes", "partial", "no"],
  ["yes", "no", "no", "yes"],
  ["yes", "yes", "partial", "no"],
];

function MarkIcon({ mark, labels }: { mark: Mark; labels: { yes: string; no: string; sometimes: string } }) {
  if (mark === "yes") return <Check className="mx-auto size-4.5 text-success" aria-label={labels.yes} />;
  if (mark === "no") return <X className="mx-auto size-4.5 text-muted-foreground/60" aria-label={labels.no} />;
  return <Minus className="mx-auto size-4.5 text-warning" aria-label={labels.sometimes} />;
}

export default async function Home() {
  const { d, money } = await getI18n();
  const h = d.home;
  const featured = listings.filter((l) => l.city === "Phnom Penh").slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid grid-cols-1 max-w-7xl gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:items-center lg:pt-16 lg:pb-24">
          <div className="relative z-10 flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary-sage" />
              {h.badge}
            </span>
            <h1 className="font-heading text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-dark-forest sm:text-6xl">
              {h.titleA}
              <br />
              <span className="italic text-accent-terracotta">{h.titleB}</span>
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              {h.lede}
            </p>
            <HeroSearch />
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {h.trust.map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-primary-sage" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative hidden h-[560px] lg:block">
            <div className="absolute top-0 right-0 h-[420px] w-[78%] overflow-hidden rounded-[2rem]">
              <Image
                src={listings[0].images[0]}
                alt={h.heroAltA}
                fill
                preload
                sizes="40vw"
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 h-[260px] w-[52%] overflow-hidden rounded-[2rem] ring-8 ring-background">
              <Image
                src={listings[1].images[0]}
                alt={h.heroAltB}
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
            <div className="absolute right-6 bottom-16 w-64 rounded-2xl bg-card p-4 shadow-xl ring-1 ring-black/5">
              <div className="flex items-center gap-2 text-xs font-semibold text-dark-forest">
                <BadgeCheck className="size-4 text-primary-sage" />
                {h.heroCardVerified}
              </div>
              <p className="mt-2 text-sm font-medium">{h.heroCardTitle}</p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-sm">
                  <span className="text-lg font-semibold tabular">{money(650)}</span>
                  <span className="text-muted-foreground"> {d.common.perMonth}</span>
                </p>
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  {h.heroCardAvailable}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Segments */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {h.segments.map(({ title, range }, i) => {
            const { icon: Icon, href } = segmentMeta[i];
            return (
            <Link
              key={title}
              href={href}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary-sage/50 hover:shadow-md"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="flex items-center justify-between font-semibold text-foreground">
                  {title}
                  <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </span>
                <span className="text-sm text-muted-foreground">{range}</span>
              </span>
            </Link>
            );
          })}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-dark-forest">
              {h.featuredTitle}
            </h2>
            <p className="mt-1 text-muted-foreground">{h.featuredSub}</p>
          </div>
          <Button variant="outline" className="hidden h-9 gap-1.5 px-3.5 sm:inline-flex" nativeButton={false} render={<Link href="/listing?city=Phnom+Penh" />}>
            {h.seeAll}
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* Verification */}
      <section className="bg-dark-forest text-background dark:bg-card dark:text-foreground">
        <div className="mx-auto grid grid-cols-1 max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold tracking-widest text-accent-terracotta uppercase">{h.verifyEyebrow}</p>
            <h2 className="font-heading text-4xl leading-tight font-semibold tracking-tight">
              {h.verifyTitle}
            </h2>
            <p className="max-w-md opacity-80">
              {h.verifyBody}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {h.checks.map(({ title, body }, i) => {
              const Icon = checkIcons[i];
              return (
              <div key={title} className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 dark:bg-muted dark:ring-border">
                <Icon className="size-6 text-accent-terracotta" />
                <p className="mt-4 font-semibold">{title}</p>
                <p className="mt-1 text-sm opacity-75">{body}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="text-center font-heading text-3xl font-semibold tracking-tight text-dark-forest">
          {h.stepsTitle}
        </h2>
        <ol className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {h.steps.map(({ title, body }, i) => {
            const Icon = stepIcons[i];
            return (
            <li key={title} className="relative flex flex-col items-center text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-card text-dark-forest shadow-sm ring-1 ring-border">
                <Icon className="size-6" />
              </span>
              <span className="mt-4 text-xs font-semibold text-accent-terracotta tabular">{h.step(i + 1)}</span>
              <p className="mt-1 text-lg font-semibold">{title}</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">{body}</p>
            </li>
            );
          })}
        </ol>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <div className="p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-semibold tracking-tight text-dark-forest">
              {h.compareTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {h.compareBody}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/50 text-xs text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium sm:px-8"> </th>
                  {h.compareCols.map((c, i) => (
                    <th key={c} className={i === 0 ? "px-3 py-3 font-semibold text-dark-forest" : "px-3 py-3 font-medium"}>
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((marks, r) => (
                  <tr key={h.compareRows[r]} className="border-b border-border last:border-0">
                    <td className="px-6 py-3 font-medium sm:px-8">{h.compareRows[r]}</td>
                    {marks.map((mark, c) => (
                      <td key={c} className={c === 0 ? "bg-accent/40 px-3 py-3" : "px-3 py-3"}>
                        <MarkIcon mark={mark} labels={d.common} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-accent-terracotta px-6 py-12 text-white sm:px-12">
          <HomeIcon className="absolute -right-8 -bottom-10 size-64 opacity-10" strokeWidth={1.2} />
          <div className="relative max-w-xl">
            <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {h.ownerTitle}
            </h2>
            <p className="mt-3 text-white/90">
              {h.ownerBody}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                className="h-11 bg-white px-5 text-base text-terracotta-strong hover:bg-white/90 dark:text-[#8a4f2e]"
                nativeButton={false}
                render={<Link href="/host/new" />}
              >
                {h.ownerCta}
              </Button>
              <Button
                variant="ghost"
                className="h-11 px-5 text-base text-white hover:bg-white/15 hover:text-white"
                nativeButton={false}
                render={<Link href="/owners" />}
              >
                {h.ownerCta2}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
