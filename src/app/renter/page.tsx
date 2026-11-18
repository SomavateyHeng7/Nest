import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { KeyRound, MessageCircle, Receipt } from "lucide-react";

import { ExtendStay } from "@/features/renter/components/extend-stay";
import { ComingSoonButton } from "@/features/renter/components/coming-soon-button";
import { RenterViewings, SavedHomes } from "@/features/renter/components/renter-sections";
import { StayRow, UpcomingStays } from "@/features/renter/components/stay-list";
import { OpenDispute } from "@/features/disputes/components/open-dispute";
import { MyDisputes } from "@/features/disputes/components/my-disputes";
import { ReviewPrompts } from "@/features/reviews/components/review-prompts";
import { WriteReview } from "@/features/reviews/components/write-review";
import { StatusBadge } from "@/features/booking/components/status-badge";
import { Button } from "@/shared/ui/button";
import { currentUser } from "@/features/account/current-user";
import { stays } from "@/features/booking/data";
import { getListingById } from "@/features/listings/data";
import { getI18n } from "@/i18n/server";
import { nextRentAmount } from "@/features/stays/lib/pricing";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.renter.title };
}

export default async function RenterPage() {
  const { d, t, date, lt, money } = await getI18n();
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

      <ReviewPrompts stays={past} />

      {active && activeListing && (
        <section className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
          <div className="grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
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
                    {r.nextRent} <span className="font-semibold tabular">{money(nextRentAmount(active, active.nextPaymentDue))}</span>{" "}
                    {r.due(date(active.nextPaymentDue, "EEE, MMM d"))}
                  </p>
                  <ComingSoonButton
                    className="h-8 bg-accent-terracotta px-3 text-white hover:bg-terracotta-strong"
                    title={r.paySoon.title}
                    description={r.paySoon.body}
                  >
                    {r.payKhqr}
                  </ComingSoonButton>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" className="h-9 gap-1.5 px-3" nativeButton={false} render={<Link href="/messages" />}>
                  <MessageCircle className="size-4" />
                  {r.messageOwner}
                </Button>
                <ExtendStay stay={active} listing={activeListing} />
                <OpenDispute
                  openedBy="renter"
                  context={{
                    listingId: active.listingId,
                    renter: currentUser.name,
                    owner: activeListing.owner.name,
                    held: Math.min(active.monthlyRent, active.rentTotal),
                    stay: { moveIn: active.moveIn, moveOut: active.moveOut },
                  }}
                />
                <ComingSoonButton
                  variant="outline"
                  className="h-9 gap-1.5 px-3"
                  title={r.checkInSoon.title}
                  description={r.checkInSoon.body}
                >
                  <KeyRound className="size-4" />
                  {r.checkIn}
                </ComingSoonButton>
              </div>
            </div>
          </div>
        </section>
      )}

      <RenterViewings />

      <section className="mt-10">
        <h2 className="font-semibold">{r.upcoming}</h2>
        <div className="mt-3 flex flex-col gap-3">
          <UpcomingStays stays={upcoming} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">{r.past}</h2>
        <div className="mt-3 flex flex-col gap-3">
          {past.map((s) => (
            <StayRow
              key={s.id}
              stay={s}
              action={
                s.status === "completed" ? (
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <WriteReview stay={s} />
                    <OpenDispute
                      openedBy="renter"
                      variant="ghost"
                      context={{
                        listingId: s.listingId,
                        renter: currentUser.name,
                        owner: getListingById(s.listingId)?.owner.name ?? "",
                        held: Math.min(s.monthlyRent, s.rentTotal),
                        stay: { moveIn: s.moveIn, moveOut: s.moveOut },
                      }}
                    />
                  </div>
                ) : undefined
              }
            />
          ))}
        </div>
      </section>

      <MyDisputes party="renter" />

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
