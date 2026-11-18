"use client";

import { useState } from "react";
import { BadgeCheck, Flag, Lock, Star } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { ReportReview } from "@/features/reviews/components/report-review";
import { Stars } from "@/features/reviews/components/stars";
import { useReviews } from "@/features/reviews/store";
import { scoreKeys, type Review } from "@/features/reviews/types";
import { useI18n } from "@/i18n/client";

const INITIAL = 4;

function ReviewItem({ review, ownerFirstName, pending }: { review: Review; ownerFirstName: string; pending?: boolean }) {
  const { d, date } = useI18n();
  const x = d.reviews;
  const store = useReviews();
  const reply = store.replyFor(review);
  const [reporting, setReporting] = useState(false);

  return (
    <li className="flex flex-col gap-2 border-b border-border pb-5 last:border-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground" aria-hidden>
          {review.author.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold" lang="en">
            {review.author}
          </p>
          <p className="text-xs text-muted-foreground">{date(review.at, "MMMM yyyy")}</p>
        </div>
        <Stars value={review.rating} label={x.outOf(review.rating)} className="ml-auto" />
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-medium text-primary-sage">
          <BadgeCheck className="size-3.5" />
          {x.verifiedStay}
        </span>
        <span>{x.stayed(d.common.nights(review.stayNights))}</span>
      </p>
      <p className="text-sm leading-relaxed" lang={review.lang}>
        {review.text}
      </p>
      {pending && (
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-warning">
          <Lock className="size-3.5" />
          {x.pending}
        </p>
      )}
      {!pending && (
        <button
          type="button"
          onClick={() => setReporting(true)}
          className="inline-flex w-fit items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <Flag className="size-3" />
          {x.report.cta}
        </button>
      )}
      <ReportReview review={review} open={reporting} onOpenChange={setReporting} />
      {reply && (
        <div className="mt-1 rounded-xl bg-muted/60 p-3 text-sm">
          <p className="text-xs font-semibold">{x.replyFrom(ownerFirstName)}</p>
          <p className="mt-1" lang="en">
            {reply.text}
          </p>
        </div>
      )}
    </li>
  );
}

/** Rating summary, per-category scores and the list of reviews for one home. */
export function ListingReviews({ listingId, ownerFirstName }: { listingId: string; ownerFirstName: string }) {
  const { d } = useI18n();
  const x = d.reviews;
  const store = useReviews();
  const [all, setAll] = useState(false);

  const list = store.publishedFor(listingId);
  const summary = store.summary(listingId);
  // The reader's own new reviews wait for Nest's check: shown to them, not counted yet.
  const pending = store.pendingFor(listingId);
  const shown = all ? list : list.slice(0, INITIAL);

  if (summary.count === 0 && pending.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center">
        <p className="font-medium">{x.none}</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{x.noneBody}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {summary.count > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10">
          <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-1">
            <p className="font-heading text-5xl font-semibold tabular text-dark-forest">{summary.average.toFixed(1)}</p>
            <div>
              <Stars value={summary.average} label={x.ratingLabel(summary.average.toFixed(1))} />
              <p className="mt-1 text-sm text-muted-foreground">{d.common.reviews(summary.count)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ul className="flex flex-col gap-1.5" aria-label={x.title}>
              {summary.distribution.map((n, i) => {
                const stars = 5 - i;
                return (
                  <li key={stars} className="flex items-center gap-2 text-xs">
                    <span className="w-14 text-muted-foreground">{x.starRow(stars)}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <span className="block h-full rounded-full bg-accent-terracotta" style={{ width: `${(n / summary.count) * 100}%` }} />
                    </span>
                    <span className="w-5 text-right tabular text-muted-foreground">{n}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="flex flex-col gap-2.5 text-sm">
              {scoreKeys.map((k) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">{x.categories[k]}</dt>
                  <dd className="flex items-center gap-1 font-medium tabular">
                    <Star className="size-3.5 fill-current text-accent-terracotta" aria-hidden />
                    {summary.categories[k].toFixed(1)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      <ul className="flex flex-col gap-5">
        {pending.map((r) => (
          <ReviewItem key={r.id} review={r} ownerFirstName={ownerFirstName} pending />
        ))}
        {shown.map((r) => (
          <ReviewItem key={r.id} review={r} ownerFirstName={ownerFirstName} />
        ))}
      </ul>

      {list.length > INITIAL && (
        <Button variant="outline" className="h-10 w-fit px-4" onClick={() => setAll((v) => !v)} aria-expanded={all}>
          {all ? x.showLess : x.showAll(list.length)}
        </Button>
      )}
    </div>
  );
}
