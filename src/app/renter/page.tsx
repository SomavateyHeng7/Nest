import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { KeyRound, MessageCircle, Receipt } from "lucide-react";

import { ExtendStay } from "@/components/activity/extend-stay";
import { RenterViewings, SavedHomes } from "@/components/activity/renter-sections";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { currentUser, stays } from "@/data/dashboard";
import { getListingById } from "@/data/listings";
import { getI18n } from "@/i18n/server";
import { formatUSD } from "@/lib/pricing";
import type { Stay } from "@/types/dashboard";

type I18n = Awaited<ReturnType<typeof getI18n>>;

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.renter.title };
}

function StayRow({ stay, i18n }: { stay: Stay; i18n: I18n }) {
  const { d, t, range, lt } = i18n;
  const listing = getListingById(stay.listingId);
  if (!listing) return null;
  const nights = differenceInCalendarDays(parseISO(stay.moveOut), parseISO(stay.moveIn));

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="flex gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-foreground/25"
    >
      <div className="relative aspect-4/3 w-28 shrink-0 overflow-hidden rounded-xl sm:w-36">
        <Image src={listing.images[0]} alt={lt(listing).text} fill sizes="144px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className="truncate font-semibold" lang={lt(listing).lang}>{lt(listing).text}</p>
          <StatusBadge status={stay.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {t(listing.district)}, {t(listing.city)} · {d.renter.hostedBy(listing.owner.name.split(" ")[0])}
        </p>
        <p className="text-sm text-muted-foreground">
          {range(stay.moveIn, stay.moveOut)} · {d.common.nights(nights)} · {d.common.guests(stay.guests)}
        </p>
        <p className="mt-auto text-sm font-medium tabular">{d.renter.totalRent(formatUSD(stay.rentTotal))}</p>
      </div>
    </Link>
  );
}

export default async function RenterPage() {
  const i18n = await getI18n();
  const { d, t, date, lt } = i18n;
  const r = d.renter;
  const today = new Date();
  const active = stays.find((s) => s.status === "active");
  const upcoming = stays.filter((s) => s.status === "confirmed" || s.status === "requested");
  const past = stays.filter((s) => s.status === "completed" || s.status === "cancelled");
  const activeListing = active ? getListingById(active.listingId) : undefined;

  let progress = 0;
  let daysLeft = 0;
  if (active) {
    const total = differenceInCalendarDays(parseISO(active.moveOut), parseISO(active.moveIn));
    const elapsed = differenceInCalendarDays(today, parseISO(active.moveIn));
    progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    daysLeft = Math.max(0, differenceInCalendarDays(parseISO(active.moveOut), today));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 pb-24 sm:px-6">
      <p className="text-sm text-muted-foreground">{r.greeting(currentUser.firstName)}</p>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-dark-forest">{r.title}</h1>

      {active && activeListing && (
        <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid md:grid-cols-[280px_1fr]">
            <div className="relative aspect-video md:aspect-auto">
              <Image src={activeListing.images[0]} alt={lt(activeListing).text} fill sizes="280px" className="object-cover" />
            </div>
            <div className="flex flex-col gap-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <StatusBadge status="active" />
                  <p className="mt-2 text-lg font-semibold" lang={lt(activeListing).lang}>{lt(activeListing).text}</p>
                  <p className="text-sm text-muted-foreground">
                    {t(activeListing.district)}, {t(activeListing.city)}
                  </p>
                </div>
                <p className="text-right text-sm">
                  <span className="block font-heading text-3xl font-semibold tabular">{daysLeft}</span>
                  <span className="text-muted-foreground">{r.daysLeft}</span>
                </p>
              </div>
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary-sage" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>{r.movedIn(date(active.moveIn, "MMM d"))}</span>
                  <span>{r.moveOut(date(active.moveOut, "MMM d"))}</span>
                </div>
              </div>
              {active.nextPaymentDue && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-accent-terracotta/10 px-4 py-3">
                  <p className="flex items-center gap-2 text-sm">
                    <Receipt className="size-4 text-accent-terracotta" />
                    {r.nextRent} <span className="font-semibold tabular">{formatUSD(286)}</span>{" "}
                    {r.due(date(active.nextPaymentDue, "EEE, MMM d"))}
                  </p>
                  <Button className="h-8 bg-accent-terracotta px-3 text-white hover:bg-terracotta-strong">{r.payKhqr}</Button>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="h-9 gap-1.5 px-3" nativeButton={false} render={<Link href="/messages" />}>
                  <MessageCircle className="size-4" />
                  {r.messageOwner}
                </Button>
                <ExtendStay stay={active} listing={activeListing} />
                <Button variant="outline" className="h-9 gap-1.5 px-3">
                  <KeyRound className="size-4" />
                  {r.checkIn}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <RenterViewings />

      <section className="mt-10">
        <h2 className="font-semibold">{r.upcoming}</h2>
        <div className="mt-3 flex flex-col gap-3">
          {upcoming.length ? (
            upcoming.map((s) => <StayRow key={s.id} stay={s} i18n={i18n} />)
          ) : (
            <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
              {r.nothing}
            </p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">{r.past}</h2>
        <div className="mt-3 flex flex-col gap-3">
          {past.map((s) => (
            <StayRow key={s.id} stay={s} i18n={i18n} />
          ))}
        </div>
      </section>

      <SavedHomes />

      <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl bg-dark-forest p-6 text-background sm:flex-row sm:items-center dark:bg-card dark:text-foreground">
        <div>
          <p className="font-semibold">{r.nextTitle}</p>
          <p className="text-sm opacity-80">{r.nextBody}</p>
        </div>
        <Button className="h-10 bg-accent-terracotta px-4 text-white hover:bg-terracotta-strong" nativeButton={false} render={<Link href="/listing" />}>
          {d.nav.findStay}
        </Button>
      </div>
    </div>
  );
}
