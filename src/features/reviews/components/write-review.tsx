"use client";

import { useState } from "react";
import { Check, PenLine } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/toast";
import { currentUser } from "@/features/account/current-user";
import { StarInput, Stars } from "@/features/reviews/components/stars";
import { publicName } from "@/features/reviews/lib";
import { useReviews } from "@/features/reviews/store";
import { scoreKeys, type ScoreKey } from "@/features/reviews/types";
import { getListingById } from "@/features/listings/data";
import { useI18n } from "@/i18n/client";
import type { Stay } from "@/features/booking/types";
import { differenceInCalendarDays, parseISO } from "date-fns";

const MIN_CHARS = 20;
const MAX_CHARS = 1000;

/** Button on a finished stay that opens the review form. Shows the rating once one is posted. */
export function WriteReview({ stay }: { stay: Stay }) {
  const { d, lt } = useI18n();
  const w = d.reviews.write;
  const store = useReviews();
  const listing = getListingById(stay.listingId);
  const existing = store.forStay(stay.id);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [scores, setScores] = useState<Partial<Record<ScoreKey, number>>>({});
  const [text, setText] = useState("");
  const [tried, setTried] = useState(false);

  if (!listing || stay.status !== "completed") return null;

  function start() {
    setRating(existing?.rating ?? 0);
    setScores(existing?.scores ?? {});
    setText(existing?.text ?? "");
    setTried(false);
    setOpen(true);
  }

  function submit() {
    setTried(true);
    const body = text.trim();
    if (!rating || body.length < MIN_CHARS) return;
    store.addReview({
      listingId: stay.listingId,
      stayId: stay.id,
      author: publicName(currentUser.name),
      rating,
      scores: { accuracy: scores.accuracy ?? rating, cleanliness: scores.cleanliness ?? rating, communication: scores.communication ?? rating },
      text: body,
      lang: /[ក-៿]/.test(body) ? "km" : "en",
      stayNights: differenceInCalendarDays(parseISO(stay.moveOut), parseISO(stay.moveIn)),
    });
    setOpen(false);
    toast.success(w.posted, { description: w.postedBody });
  }

  const optionLabel = d.reviews.outOf;
  const tooShort = text.trim().length < MIN_CHARS;

  return (
    <>
      <div className="flex items-center gap-3">
        {existing && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="size-3.5 text-success" />
            {d.reviews.yourReview}
            <Stars value={existing.rating} label={d.reviews.outOf(existing.rating)} />
          </span>
        )}
        <Button variant={existing ? "ghost" : "outline"} className="h-9 gap-1.5 px-3" onClick={start}>
          <PenLine className="size-4" />
          {existing ? w.edit : w.cta}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen} title={w.title} description={w.sub(lt(listing).text)} closeLabel={w.close}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-semibold">{w.overall}</p>
            <StarInput value={rating} onChange={setRating} label={w.overall} optionLabel={optionLabel} />
            {tried && !rating && <p className="text-xs font-medium text-destructive">{w.needRating}</p>}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground">{w.details}</p>
            {scoreKeys.map((k) => (
              <div key={k} className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm">{d.reviews.categories[k]}</span>
                <StarInput value={scores[k] ?? 0} onChange={(n) => setScores((s) => ({ ...s, [k]: n }))} label={d.reviews.categories[k]} optionLabel={optionLabel} />
              </div>
            ))}
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            {w.text}
            <textarea
              value={text}
              maxLength={MAX_CHARS}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder={w.placeholder}
              aria-invalid={tried && tooShort}
              className="rounded-xl border border-input bg-transparent px-3 py-2 text-sm font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <span className={tried && tooShort ? "text-xs font-medium text-destructive" : "text-xs font-normal text-muted-foreground"}>
              {w.min(MIN_CHARS)} · {text.trim().length}/{MAX_CHARS}
            </span>
          </label>

          <p className="text-xs text-muted-foreground">{w.public}</p>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="h-10 px-4" onClick={() => setOpen(false)}>
              {w.cancel}
            </Button>
            <Button className="h-10 px-4" onClick={submit}>
              {w.submit}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
