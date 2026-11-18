"use client";

import { useState } from "react";
import { MessageSquareReply } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { Stars } from "@/features/reviews/components/stars";
import { useReviews } from "@/features/reviews/store";
import { getListingById } from "@/features/listings/data";
import { useI18n } from "@/i18n/client";

const MAX_REPLY = 500;

/** The owner's latest reviews with a public reply box under any that are still unanswered. */
export function OwnerReviews({ listingIds }: { listingIds: string[] }) {
  const { d, relative, lt } = useI18n();
  const o = d.reviews.owner;
  const store = useReviews();
  const [replying, setReplying] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const mine = store.withStatus("published").filter((r) => listingIds.includes(r.listingId)).slice(0, 6);
  const unanswered = mine.filter((r) => !store.replyFor(r)).length;

  if (mine.length === 0) {
    return <p className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">{o.empty}</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 className="font-semibold">{o.title}</h2>
        {unanswered > 0 && <span className="text-sm font-medium text-warning">{o.waiting(unanswered)}</span>}
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{o.sub}</p>
      <ul className="flex flex-col gap-3">
        {mine.map((r) => {
          const listing = getListingById(r.listingId);
          const reply = store.replyFor(r);
          return (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-sm font-semibold" lang="en">
                  {r.author}
                </p>
                <Stars value={r.rating} label={d.reviews.outOf(r.rating)} />
                <span className="ml-auto text-xs text-muted-foreground" suppressHydrationWarning>
                  {relative(r.at)}
                </span>
              </div>
              {listing && <p className="text-xs text-muted-foreground">{lt(listing).text}</p>}
              <p className="mt-2 text-sm" lang={r.lang}>
                {r.text}
              </p>
              {reply ? (
                <p className="mt-3 rounded-xl bg-muted/60 p-3 text-sm" lang="en">
                  {reply.text}
                </p>
              ) : replying === r.id ? (
                <div className="mt-3 flex flex-col gap-2">
                  <textarea
                    value={draft}
                    maxLength={MAX_REPLY}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    placeholder={o.placeholder}
                    aria-label={o.placeholder}
                    className="rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                  <div className="flex gap-2">
                    <Button
                      className="h-9 px-3"
                      disabled={!draft.trim()}
                      onClick={() => {
                        store.addReply(r.id, draft.trim());
                        setReplying(null);
                        toast.success(o.posted);
                      }}
                    >
                      {o.send}
                    </Button>
                    <Button variant="ghost" className="h-9 px-3" onClick={() => setReplying(null)}>
                      {o.cancel}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-3 h-9 gap-1.5 px-3"
                  onClick={() => {
                    setDraft("");
                    setReplying(r.id);
                  }}
                >
                  <MessageSquareReply className="size-4" />
                  {o.reply}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
