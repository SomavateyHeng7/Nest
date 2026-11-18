"use client";

import { useState } from "react";
import { addHours, parseISO } from "date-fns";
import { Clock, FileImage, Lock, MessageSquare, RotateCcw, Scale, Send, Star } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/toast";
import { useAudit, type AuditAction } from "@/features/admin/audit";
import {
  currentStaff,
  DISPUTE_SLA_HOURS,
  type Dispute,
  type DisputeOutcome,
  type DisputeParty,
  type DisputeStatus,
} from "@/features/admin/data";
import { useDisputes } from "@/features/disputes/store";
import { getListingById } from "@/features/listings/data";
import { Stars } from "@/features/reviews/components/stars";
import { publicName } from "@/features/reviews/lib";
import { useReviews } from "@/features/reviews/store";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

const tabs: DisputeStatus[] = ["open", "investigating", "resolved"];
const outcomes: DisputeOutcome[] = ["refund-full", "refund-partial", "release-owner", "dismissed"];

const eventId = () => `ev-${crypto.randomUUID()}`;

const field =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function StatusPill({ status, label }: { status: DisputeStatus; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2 text-xs font-semibold",
        status === "open" && "bg-warning/15 text-warning",
        status === "investigating" && "bg-accent text-accent-foreground",
        status === "resolved" && "bg-success/15 text-success"
      )}
    >
      {label}
    </span>
  );
}

export function DisputesBoard() {
  const { d, t, date, range, relative, money, lt } = useI18n();
  const x = d.admin.disputes;
  const tt = d.admin.toast;
  const { log } = useAudit();
  // Read once per visit so the overdue badge doesn't flicker between renders.
  const [now] = useState(() => Date.now());

  const { items, patch: patchDispute } = useDisputes();
  const reviewStore = useReviews();
  const [tab, setTab] = useState<DisputeStatus>("open");
  const [openId, setOpenId] = useState<string | null>(null);

  const [note, setNote] = useState("");
  const [ask, setAsk] = useState("");
  const [outcome, setOutcome] = useState<DisputeOutcome>("refund-full");
  const [refund, setRefund] = useState(0);
  const [message, setMessage] = useState("");

  const open = items.find((i) => i.id === openId);
  const shown = items.filter((i) => i.status === tab);

  const patch = patchDispute;
  const nameOf = (i: Dispute, party: DisputeParty) => (party === "renter" ? i.renter : i.owner);
  const record = (i: Dispute, action: AuditAction, detail?: string) => log({ action, target: i.renter, ref: i.id, detail });

  function openCase(i: Dispute) {
    setNote("");
    setAsk("");
    setMessage("");
    setOutcome("refund-full");
    setRefund(Math.round(i.held / 2));
    setOpenId(i.id);
  }

  function startReview(i: Dispute) {
    patch(i.id, (c) => ({ ...c, status: "investigating", assignee: currentStaff.name }));
    record(i, "dispute.investigating");
    toast.info(tt.disputeInvestigating(i.id));
  }

  function addNote(i: Dispute) {
    const text = note.trim();
    if (!text) return;
    patch(i.id, (c) => ({
      ...c,
      timeline: [...c.timeline, { id: eventId(), at: new Date().toISOString(), kind: "note", by: currentStaff.name, text }],
    }));
    record(i, "dispute.noted", text.slice(0, 160));
    setNote("");
    toast.success(tt.disputeNote);
  }

  function askEvidence(i: Dispute, party: DisputeParty) {
    const text = ask.trim();
    if (!text) return;
    patch(i.id, (c) => ({
      ...c,
      timeline: [...c.timeline, { id: eventId(), at: new Date().toISOString(), kind: "request", by: currentStaff.name, party, text }],
    }));
    record(i, "dispute.evidenceRequested", `${x.from[party]}: ${text.slice(0, 160)}`);
    setAsk("");
    toast.success(tt.disputeEvidence(x.from[party].toLowerCase()));
  }

  function resolve(i: Dispute) {
    const text = message.trim();
    if (!text) return;
    const amount = outcome === "refund-full" ? i.held : outcome === "refund-partial" ? refund : 0;
    patch(i.id, (c) => ({
      ...c,
      status: "resolved",
      assignee: c.assignee ?? currentStaff.name,
      resolution: { outcome, refund: amount, note: text, resolvedAt: new Date().toISOString(), by: currentStaff.name },
    }));
    record(i, "dispute.resolved", `${x.outcomes[outcome]}${amount > 0 ? ` · $${amount}` : ""}`);
    setOpenId(null);
    toast.success(tt.disputeResolved(i.id));
  }

  function reopen(i: Dispute) {
    patch(i.id, (c) => ({ ...c, status: "investigating", resolution: undefined }));
    record(i, "dispute.reopened");
    toast.info(tt.disputeReopened(i.id));
  }

  const refundValid = open ? refund > 0 && refund < open.held : false;
  const canResolve = Boolean(open && message.trim() && (outcome !== "refund-partial" || refundValid));
  const resolveRefund = open ? (outcome === "refund-full" ? open.held : outcome === "refund-partial" ? refund : 0) : 0;

  return (
    <>
      <div role="tablist" className="mb-5 flex gap-2 overflow-x-auto scrollbar-none">
        {tabs.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={tab === s}
            onClick={() => setTab(s)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === s ? "border-dark-forest bg-dark-forest text-background" : "border-border bg-card hover:border-foreground/30"
            )}
          >
            {x.tabs[s]}
            <span className={cn("text-xs tabular", tab === s ? "opacity-80" : "text-muted-foreground")}>
              {items.filter((i) => i.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">{x.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((i) => {
            const listing = getListingById(i.listingId);
            const due = addHours(parseISO(i.openedAt), DISPUTE_SLA_HOURS);
            return (
              <li key={i.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={i.status} label={x.tabs[i.status]} />
                  <p className="font-semibold">{x.kind[i.kind]}</p>
                  <span className="text-xs text-muted-foreground">#{i.id}</span>
                  <span className="ml-auto text-xs text-muted-foreground" suppressHydrationWarning>
                    {relative(i.openedAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground" lang="en">
                  {i.renter} · {i.owner} · {listing ? lt(listing).text : i.listingId}
                </p>
                <p className="mt-3 text-sm" lang="en">
                  {i.summary}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  <span>
                    <span className="text-muted-foreground">{x.held}: </span>
                    <span className="font-semibold tabular">{money(i.held)}</span>
                  </span>
                  {i.status === "open" && (
                    <span
                      className={cn("inline-flex items-center gap-1.5 text-xs font-medium", now > due.getTime() && "text-destructive")}
                      suppressHydrationWarning
                    >
                      <Clock className="size-3.5" />
                      {now > due.getTime() ? `${x.overdue} · ` : ""}
                      {x.due(relative(due))}
                    </span>
                  )}
                  {i.assignee && <span className="text-xs text-muted-foreground">{x.assigned(i.assignee)}</span>}
                  <Button className="ml-auto h-9 gap-1.5 px-3" variant={i.status === "resolved" ? "outline" : "default"} onClick={() => openCase(i)}>
                    <Scale className="size-4" />
                    {x.open}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={Boolean(open)}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={open ? `${x.dialogTitle} #${open.id}` : x.dialogTitle}
        description={open ? `${x.kind[open.kind]} · ${x.openedBy(nameOf(open, open.openedBy))}` : undefined}
        closeLabel={x.close}
        className="sm:w-[min(42rem,calc(100vw-2rem))]"
      >
        {open && (
          <div className="flex flex-col gap-5">
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">{x.renter}</dt>
                <dd className="font-medium" lang="en">
                  {open.renter}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{x.owner}</dt>
                <dd className="font-medium" lang="en">
                  {open.owner}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{x.held}</dt>
                <dd className="font-semibold tabular">{money(open.held)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{x.stay(range(open.stay.moveIn, open.stay.moveOut))}</dt>
                <dd className="font-medium">
                  {(() => {
                    const l = getListingById(open.listingId);
                    return l ? `${lt(l).text} · ${t(l.district)}` : open.listingId;
                  })()}
                </dd>
              </div>
            </dl>

            <section>
              <h3 className="text-sm font-semibold">{x.summary}</h3>
              <p className="mt-1 text-sm text-muted-foreground" lang="en">
                {open.summary}
              </p>
            </section>

            {(() => {
              const summary = reviewStore.summary(open.listingId);
              const all = reviewStore.allFor(open.listingId);
              const lowest = all.filter((r) => reviewStore.statusOf(r) === "published").sort((a, b) => a.rating - b.rating || b.at.localeCompare(a.at)).slice(0, 2);
              const renterReview = all.find((r) => r.author === publicName(open.renter));
              const status = renterReview ? reviewStore.statusOf(renterReview) : undefined;
              const target = (r: NonNullable<typeof renterReview>) => `${r.author} · ${getListingById(r.listingId)?.title ?? r.listingId}`;
              return (
                <section className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold">{d.reviews.dispute.title}</h3>
                  {summary.count === 0 ? (
                    <p className="text-sm text-muted-foreground">{d.reviews.dispute.none}</p>
                  ) : (
                    <>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Star className="size-3.5 fill-current text-accent-terracotta" aria-hidden />
                          {d.reviews.dispute.summary(summary.average.toFixed(1), summary.count)}
                        </span>
                        <span className={cn("text-muted-foreground", open.kind === "mismatch" && "font-medium text-foreground")}>
                          {d.reviews.dispute.accuracy(summary.categories.accuracy.toFixed(1))}
                        </span>
                      </p>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground">{d.reviews.dispute.lowest}</p>
                        <ul className="mt-1.5 flex flex-col gap-1.5">
                          {lowest.map((rv) => (
                            <li key={rv.id} className="rounded-lg bg-muted/60 p-2.5 text-sm">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground" lang="en">
                                  {rv.author}
                                </span>{" "}
                                · {d.reviews.outOf(rv.rating)} · {d.reviews.categories.accuracy} {rv.scores.accuracy}/5
                              </p>
                              <p className="mt-0.5" lang={rv.lang}>
                                {rv.text}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  <div className="rounded-xl border border-border p-3">
                    <p className="text-xs font-semibold text-muted-foreground">{d.reviews.dispute.renterReview}</p>
                    {!renterReview ? (
                      <p className="mt-1 text-sm text-muted-foreground">{d.reviews.dispute.noRenterReview}</p>
                    ) : (
                      <>
                        <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                          <Stars value={renterReview.rating} label={d.reviews.outOf(renterReview.rating)} />
                          {status === "hidden" && <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{d.reviews.dispute.hiddenNow}</span>}
                        </p>
                        <p className="mt-1 text-sm" lang={renterReview.lang}>
                          {renterReview.text}
                        </p>
                        {(status === "published" || status === "pending") && (
                          <Button
                            variant="outline"
                            className="mt-2 h-8 px-3"
                            onClick={() => {
                              reviewStore.moderate(renterReview.id, "hidden");
                              log({ action: "review.hidden", target: target(renterReview), ref: renterReview.id, detail: `${open.id}` });
                              toast.info(tt.reviewHidden);
                            }}
                          >
                            {d.admin.reviews.hide}
                          </Button>
                        )}
                        {status === "hidden" && (
                          <Button
                            variant="outline"
                            className="mt-2 h-8 px-3"
                            onClick={() => {
                              reviewStore.moderate(renterReview.id, reviewStore.isMine(renterReview) ? "approved" : null);
                              log({ action: "review.restored", target: target(renterReview), ref: renterReview.id, detail: `${open.id}` });
                              toast.info(tt.reviewRestored);
                            }}
                          >
                            {d.admin.reviews.restore}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </section>
              );
            })()}

            <section>
              <h3 className="text-sm font-semibold">{x.evidence}</h3>
              {open.evidence.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">{x.noEvidence}</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1.5">
                  {open.evidence.map((e) => (
                    <li key={e.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                      <FileImage className="size-4 text-primary-sage" />
                      <span className="min-w-0 flex-1 truncate" lang="en">
                        {e.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {x.from[e.from]} · {date(e.at, "MMM d, HH:mm")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold">{x.conversation}</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {open.timeline.map((e) => (
                  <li
                    key={e.id}
                    className={cn(
                      "rounded-xl p-3 text-sm",
                      e.kind === "note" ? "border border-dashed border-warning/50 bg-warning/5" : e.kind === "request" ? "bg-accent/60" : "bg-muted/60"
                    )}
                  >
                    <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground" lang="en">
                        {e.by}
                      </span>
                      {e.kind === "message" && e.party && <span>{x.from[e.party]}</span>}
                      {e.kind === "request" && e.party && (
                        <span className="inline-flex items-center gap-1">
                          <Send className="size-3" />
                          {x.from[e.party]}
                        </span>
                      )}
                      {e.kind === "note" && (
                        <span className="inline-flex items-center gap-1 font-medium text-warning">
                          <Lock className="size-3" />
                          {x.internalOnly}
                        </span>
                      )}
                      <span className="ml-auto">{date(e.at, "MMM d, HH:mm")}</span>
                    </p>
                    <p className="mt-1" lang="en">
                      {e.text}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {open.status !== "resolved" ? (
              <>
                <section className="flex flex-col gap-2 rounded-xl border border-border p-3">
                  <label className="flex flex-col gap-1 text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <Lock className="size-3" />
                      {x.internal}
                      <span className="font-normal text-muted-foreground">· {x.internalOnly}</span>
                    </span>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={x.notePlaceholder} className={field} />
                  </label>
                  <Button variant="outline" className="h-9 w-fit gap-1.5 px-3" disabled={!note.trim()} onClick={() => addNote(open)}>
                    <MessageSquare className="size-4" />
                    {x.addNote}
                  </Button>
                </section>

                {open.status === "open" && (
                  <Button className="h-10 w-fit px-4" onClick={() => startReview(open)}>
                    {x.startReview}
                  </Button>
                )}

                <section className="flex flex-col gap-2 rounded-xl border border-border p-3">
                  <label className="flex flex-col gap-1 text-xs font-medium">
                    {x.evidencePrompt}
                    <input value={ask} onChange={(e) => setAsk(e.target.value)} className={cn(field, "h-9 py-0")} />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="h-9 px-3" disabled={!ask.trim()} onClick={() => askEvidence(open, "renter")}>
                      {x.askRenter}
                    </Button>
                    <Button variant="outline" className="h-9 px-3" disabled={!ask.trim()} onClick={() => askEvidence(open, "owner")}>
                      {x.askOwner}
                    </Button>
                  </div>
                </section>

                <section className="flex flex-col gap-3 border-t border-border pt-4">
                  <h3 className="text-sm font-semibold">{x.resolveTitle}</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-xs font-medium">
                      {x.outcome}
                      <select
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value as DisputeOutcome)}
                        className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                      >
                        {outcomes.map((o) => (
                          <option key={o} value={o}>
                            {x.outcomes[o]}
                          </option>
                        ))}
                      </select>
                    </label>
                    {outcome === "refund-partial" && (
                      <label className="flex flex-col gap-1 text-xs font-medium">
                        {x.refund}
                        <input
                          type="number"
                          inputMode="decimal"
                          min={1}
                          max={open.held - 1}
                          step={1}
                          value={refund || ""}
                          onChange={(e) => setRefund(Number(e.target.value))}
                          aria-invalid={!refundValid}
                          className={cn(field, "h-9 py-0 tabular", !refundValid && "border-destructive")}
                        />
                        <span className={cn("font-normal", refundValid ? "text-muted-foreground" : "text-destructive")}>
                          {x.refundMax(money(open.held - 1))}
                        </span>
                      </label>
                    )}
                  </div>
                  {outcome !== "dismissed" && (
                    <p className="text-sm text-muted-foreground tabular">{x.split(money(resolveRefund), money(open.held - resolveRefund))}</p>
                  )}
                  <label className="flex flex-col gap-1 text-xs font-medium">
                    {x.message}
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder={x.messagePlaceholder} className={field} />
                  </label>
                  <Button className="h-10 w-fit px-4" disabled={!canResolve} onClick={() => resolve(open)}>
                    {x.resolve}
                  </Button>
                </section>
              </>
            ) : (
              open.resolution && (
                <section className="flex flex-col gap-2 rounded-xl border border-success/40 bg-success/5 p-3 text-sm">
                  <p className="font-semibold">{x.outcomes[open.resolution.outcome]}</p>
                  {open.resolution.outcome !== "dismissed" && (
                    <p className="text-muted-foreground tabular">
                      {x.split(money(open.resolution.refund), money(open.held - open.resolution.refund))}
                    </p>
                  )}
                  <p lang="en">{open.resolution.note}</p>
                  <p className="text-xs text-muted-foreground">{x.resolvedBy(date(open.resolution.resolvedAt, "MMM d, HH:mm"), open.resolution.by)}</p>
                  <Button variant="outline" className="h-9 w-fit gap-1.5 px-3" onClick={() => reopen(open)}>
                    <RotateCcw className="size-4" />
                    {x.reopen}
                  </Button>
                </section>
              )
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
