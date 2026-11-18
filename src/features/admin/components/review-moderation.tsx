"use client";

import { useState } from "react";
import { BadgeCheck, Check, EyeOff, Flag, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { useAudit, type AuditAction } from "@/features/admin/audit";
import { getListingById } from "@/features/listings/data";
import { useDisputes } from "@/features/disputes/store";
import { publicName } from "@/features/reviews/lib";
import { Stars } from "@/features/reviews/components/stars";
import { useReviews, type ReviewDecision } from "@/features/reviews/store";
import type { Review } from "@/features/reviews/types";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

type Tab = "pending" | "reported" | "hidden";
const tabs: Tab[] = ["pending", "reported", "hidden"];

export function ReviewModeration() {
  const { d, date, lt } = useI18n();
  const x = d.admin.reviews;
  const tt = d.admin.toast;
  const store = useReviews();
  const { log } = useAudit();
  const disputes = useDisputes();
  const [tab, setTab] = useState<Tab>("pending");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const reportedIds = [...new Set(store.openReports.map((r) => r.reviewId))];
  const lists: Record<Tab, Review[]> = {
    pending: store.withStatus("pending"),
    reported: reportedIds.map((id) => store.find(id)).filter((r): r is Review => Boolean(r) && store.statusOf(r!) === "published"),
    hidden: [...store.withStatus("hidden"), ...store.withStatus("removed")],
  };
  const shown = lists[tab];

  const homeOf = (r: Review) => {
    const listing = getListingById(r.listingId);
    return listing ? lt(listing).text : r.listingId;
  };
  const record = (action: AuditAction, r: Review, detail?: string) => log({ action, target: `${r.author} · ${homeOf(r)}`, ref: r.id, detail });

  function decide(r: Review, decision: ReviewDecision | null, action: AuditAction, message: string) {
    store.moderate(r.id, decision);
    record(action, r);
    setConfirmRemove(null);
    toast.success(message);
  }

  return (
    <>
      <div role="tablist" className="mb-5 flex gap-2 overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t ? "border-dark-forest bg-dark-forest text-background" : "border-border bg-card hover:border-foreground/30"
            )}
          >
            {x.tabs[t]}
            <span className={cn("text-xs tabular", tab === t ? "opacity-80" : "text-muted-foreground")}>{lists[t].length}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">{x.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((r) => {
            const status = store.statusOf(r);
            const reports = store.openReports.filter((rep) => rep.reviewId === r.id);
            return (
              <li key={r.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="font-semibold" lang="en">
                    {r.author}
                  </p>
                  <Stars value={r.rating} label={d.reviews.outOf(r.rating)} />
                  <span className="inline-flex items-center gap-1 text-xs text-primary-sage">
                    <BadgeCheck className="size-3.5" />
                    {d.reviews.verifiedStay}
                  </span>
                  {(status === "hidden" || status === "removed") && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{x.status[status]}</span>
                  )}
                  {disputes.items.some((c) => c.status !== "resolved" && c.listingId === r.listingId && publicName(c.renter) === r.author) && (
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">{x.dispute}</span>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">{date(r.at, "MMM d, yyyy")}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{x.about(homeOf(r))}</p>
                <blockquote className="mt-3 border-l-2 border-border pl-3 text-sm" lang={r.lang}>
                  {r.text}
                </blockquote>
                {reports.length > 0 && (
                  <ul className="mt-3 flex flex-wrap items-center gap-2">
                    <li className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                      <Flag className="size-3.5" />
                      {x.reported(reports.length)}
                    </li>
                    {reports.map((rep) => (
                      <li key={rep.id} className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                        {d.reviews.report.reasons[rep.reason]}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {status === "pending" && (
                    <Button className="h-9 gap-1.5 px-3" onClick={() => decide(r, "approved", "review.approved", tt.reviewApproved)}>
                      <Check className="size-4" />
                      {x.approve}
                    </Button>
                  )}
                  {(status === "pending" || status === "published") && (
                    <Button variant="outline" className="h-9 gap-1.5 px-3" onClick={() => decide(r, "hidden", "review.hidden", tt.reviewHidden)}>
                      <EyeOff className="size-4" />
                      {x.hide}
                    </Button>
                  )}
                  {status === "hidden" && (
                    <Button
                      variant="outline"
                      className="h-9 gap-1.5 px-3"
                      onClick={() => decide(r, store.isMine(r) ? "approved" : null, "review.restored", tt.reviewRestored)}
                    >
                      <RotateCcw className="size-4" />
                      {x.restore}
                    </Button>
                  )}
                  {reports.length > 0 && (
                    <Button
                      variant="ghost"
                      className="h-9 px-3"
                      onClick={() => {
                        store.dismissReports(r.id);
                        record("review.reportDismissed", r);
                        toast.info(tt.reviewDismissed);
                      }}
                    >
                      {x.dismiss}
                    </Button>
                  )}
                  {status !== "removed" &&
                    (confirmRemove === r.id ? (
                      <span className="ml-auto flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{x.removeWarn}</span>
                        <Button
                          className="h-9 bg-destructive px-3 text-white hover:bg-destructive/90"
                          onClick={() => decide(r, "removed", "review.removed", tt.reviewRemoved)}
                        >
                          {x.remove}
                        </Button>
                        <Button variant="ghost" className="h-9 px-3" onClick={() => setConfirmRemove(null)}>
                          {d.reviews.write.cancel}
                        </Button>
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        className="ml-auto h-9 gap-1.5 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setConfirmRemove(r.id)}
                      >
                        <Trash2 className="size-4" />
                        {x.remove}
                      </Button>
                    ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
