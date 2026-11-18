"use client";

import { useState } from "react";

import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/toast";
import { reportReasons, useReviews, type ReportReason } from "@/features/reviews/store";
import type { Review } from "@/features/reviews/types";
import { useI18n } from "@/i18n/client";

/** Lets any visitor flag a review for Nest staff. Staff see it in the admin review queue. */
export function ReportReview({ review, open, onOpenChange }: { review: Review; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { d } = useI18n();
  const x = d.reviews.report;
  const { report } = useReviews();
  const [reason, setReason] = useState<ReportReason>("notReal");

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={x.title} description={x.sub} closeLabel={x.close}>
      <div className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-1">
          <legend className="sr-only">{x.title}</legend>
          {reportReasons.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-muted">
              <input type="radio" name={`report-${review.id}`} checked={reason === r} onChange={() => setReason(r)} className="size-4 accent-[var(--brand-forest)]" />
              {x.reasons[r]}
            </label>
          ))}
        </fieldset>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" className="h-10 px-4" onClick={() => onOpenChange(false)}>
            {x.cancel}
          </Button>
          <Button
            className="h-10 px-4"
            onClick={() => {
              report(review.id, reason);
              onOpenChange(false);
              toast.success(x.thanks);
            }}
          >
            {x.send}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
