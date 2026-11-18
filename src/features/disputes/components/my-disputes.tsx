"use client";

import { useState } from "react";
import { FileImage, Paperclip, Send } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/toast";
import { currentUser } from "@/features/account/current-user";
import type { Dispute, DisputeParty } from "@/features/admin/data";
import { useDisputes, visibleTimeline } from "@/features/disputes/store";
import { getListingById } from "@/features/listings/data";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

/** The cases this person is part of, where they follow Nest's replies and add messages or evidence. */
export function MyDisputes({ party }: { party: DisputeParty }) {
  const { d, date, relative, money, lt } = useI18n();
  const x = d.disputes;
  const store = useDisputes();
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");

  const mine = store.forPerson(party, currentUser.name);
  const open = mine.find((c) => c.id === openId);
  if (mine.length === 0) return null;

  const homeOf = (c: Dispute) => {
    const l = getListingById(c.listingId);
    return l ? lt(l).text : c.listingId;
  };

  return (
    <section className="mt-10">
      <h2 className="font-semibold">{x.mine}</h2>
      <p className="text-sm text-muted-foreground">{x.mineSub}</p>
      <ul className="mt-3 flex flex-col gap-3">
        {mine.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {d.admin.disputes.kind[c.kind]} <span className="text-xs font-normal text-muted-foreground">#{c.id}</span>
              </p>
              <p className="truncate text-sm text-muted-foreground" lang="en">
                {homeOf(c)} · {money(c.held)}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex h-6 items-center rounded-full px-2 text-xs font-semibold",
                c.status === "open" && "bg-warning/15 text-warning",
                c.status === "investigating" && "bg-accent text-accent-foreground",
                c.status === "resolved" && "bg-success/15 text-success"
              )}
            >
              {x.status[c.status]}
            </span>
            <Button
              variant="outline"
              className="h-9 px-3"
              onClick={() => {
                setText("");
                setOpenId(c.id);
              }}
            >
              {x.view}
            </Button>
          </li>
        ))}
      </ul>

      <Dialog
        open={Boolean(open)}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open ? `${d.admin.disputes.kind[open.kind]} · #${open.id}` : ""}
        description={open ? x.status[open.status] : undefined}
        closeLabel={x.close}
        className="sm:w-[min(38rem,calc(100vw-2rem))]"
      >
        {open && (
          <div className="flex flex-col gap-4">
            {open.resolution && (
              <div className="rounded-xl border border-success/40 bg-success/5 p-3 text-sm">
                <p className="font-semibold">
                  {x.outcomeTitle}: {d.admin.disputes.outcomes[open.resolution.outcome]}
                </p>
                <p className="mt-1" lang="en">
                  {open.resolution.note}
                </p>
              </div>
            )}

            <ul className="flex flex-col gap-2">
              {visibleTimeline(open).map((e) => {
                const own = e.kind === "message" && e.party === party;
                return (
                  <li key={e.id} className={cn("rounded-xl p-3 text-sm", e.kind === "request" ? "bg-accent/60" : own ? "bg-muted" : "bg-muted/50")}>
                    <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{e.kind === "request" ? x.nest : own ? x.you : e.by}</span>
                      {e.kind === "request" && <span className="font-medium text-foreground">· {x.asked}</span>}
                      <span className="ml-auto" suppressHydrationWarning>
                        {date(e.at, "MMM d, HH:mm")} · {relative(e.at)}
                      </span>
                    </p>
                    <p className="mt-1" lang="en">
                      {e.text}
                    </p>
                  </li>
                );
              })}
            </ul>

            {open.evidence.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {open.evidence.map((ev) => (
                  <li key={ev.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs" lang="en">
                    <FileImage className="size-3.5 text-primary-sage" />
                    {ev.name}
                  </li>
                ))}
              </ul>
            )}

            {open.status !== "resolved" && (
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <label className="flex flex-col gap-1 text-xs font-medium">
                  {x.message}
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    className="rounded-xl border border-input bg-transparent px-3 py-2 text-sm font-normal outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    className="h-9 gap-1.5 px-3"
                    disabled={!text.trim()}
                    onClick={() => {
                      store.addMessage(open.id, party, currentUser.name, text.trim());
                      setText("");
                      toast.success(x.sent);
                    }}
                  >
                    <Send className="size-4" />
                    {x.send}
                  </Button>
                  <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
                    <Paperclip className="size-4" />
                    {x.addEvidence}
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const names = Array.from(e.target.files ?? []).map((f) => f.name);
                        if (names.length) {
                          store.addEvidence(open.id, party, names);
                          toast.success(x.evidenceAdded);
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">{x.privacy}</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </section>
  );
}
