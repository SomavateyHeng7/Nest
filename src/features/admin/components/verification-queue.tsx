"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarCheck, Check, CircleDashed, FileText, ImageIcon, UserCheck } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/toast";
import { inspectors, verificationQueue, type DocState, type VerificationItem, type VerificationStage } from "@/features/admin/data";
import { viewingTimes } from "@/features/viewings/data";
import { useI18n } from "@/i18n/client";
import { formatUSD } from "@/features/stays/lib/pricing";
import { cn } from "@/shared/lib/utils";

const stages: (VerificationStage | "all")[] = ["all", "docs", "visit", "ready"];

/** Stage follows from the checks, so it can never disagree with them. */
function stageOf(item: VerificationItem): VerificationStage {
  if (item.docs.identity !== "approved" || item.docs.ownership !== "approved") return "docs";
  if (!item.visit?.done) return "visit";
  return "ready";
}

function DocPill({ state, label }: { state: DocState; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-semibold",
        state === "approved" && "bg-success/15 text-success",
        state === "received" && "bg-warning/15 text-warning",
        state === "missing" && "bg-destructive/10 text-destructive"
      )}
    >
      {state === "approved" ? <Check className="size-3" /> : <CircleDashed className="size-3" />}
      {label}
    </span>
  );
}

export function VerificationQueue() {
  const { d, t, date, relative } = useI18n();
  const v = d.admin.verify;
  const tt = d.admin.toast;
  const [items, setItems] = useState(verificationQueue);
  const [filter, setFilter] = useState<VerificationStage | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [visitDraft, setVisitDraft] = useState({ inspector: inspectors[0], date: "2026-11-19", time: "10:30" });
  const [reason, setReason] = useState(0);
  const [published, setPublished] = useState<string[]>([]);

  const live = items.filter((i) => !published.includes(i.id));
  const shown = live.filter((i) => filter === "all" || stageOf(i) === filter);
  const open = items.find((i) => i.id === openId);

  const update = (id: string, fn: (i: VerificationItem) => VerificationItem) =>
    setItems((list) => list.map((i) => (i.id === id ? fn(i) : i)));

  function setDoc(item: VerificationItem, key: "identity" | "ownership", state: DocState) {
    update(item.id, (i) => ({ ...i, docs: { ...i.docs, [key]: state } }));
    if (state === "approved") toast.success(tt.docApproved, { description: `${item.title} · ${key === "identity" ? v.identity : v.ownership}` });
    else toast.info(tt.docRequested(item.ownerName.split(" ")[0]));
  }

  function publish(item: VerificationItem) {
    setPublished((p) => [...p, item.id]);
    setOpenId(null);
    toast.success(tt.published, {
      description: item.title,
      action: { label: d.toast.undo, onClick: () => setPublished((p) => p.filter((x) => x !== item.id)) },
    });
  }

  return (
    <>
      <div role="tablist" className="mb-5 flex gap-2 overflow-x-auto scrollbar-none">
        {stages.map((s) => {
          const count = s === "all" ? live.length : live.filter((i) => stageOf(i) === s).length;
          return (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={filter === s}
              onClick={() => setFilter(s)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === s ? "border-dark-forest bg-dark-forest text-background" : "border-border bg-card hover:border-foreground/30"
              )}
            >
              {v.stages[s]}
              <span className={cn("text-xs tabular", filter === s ? "opacity-80" : "text-muted-foreground")}>{count}</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">{v.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((item) => {
            const stage = stageOf(item);
            return (
              <li key={item.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
                <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-xl sm:w-32">
                  <Image src={item.image} alt="" fill sizes="128px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold" lang="en">
                      {item.title}
                    </p>
                    <span className="text-xs text-muted-foreground">#{item.id}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {d.propertyType[item.type]} · {t(item.district)} · {v.monthly(formatUSD(item.monthly))} · {item.ownerName}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <DocPill state={item.docs.identity} label={`${v.identity}: ${v.docState[item.docs.identity]}`} />
                    <DocPill state={item.docs.ownership} label={`${v.ownership}: ${v.docState[item.docs.ownership]}`} />
                    <DocPill
                      state={item.visit?.done ? "approved" : item.visit ? "received" : "missing"}
                      label={
                        item.visit?.done
                          ? v.visitDone(item.visit.inspector)
                          : item.visit
                            ? v.visitAt(`${date(item.visit.date, "MMM d")} ${item.visit.time}`, item.visit.inspector)
                            : v.visitNone
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {v.submitted(relative(item.submittedAt))}
                  </span>
                  <Button
                    className={cn("h-9 px-4", stage === "ready" && "bg-accent-terracotta text-white hover:bg-terracotta-strong")}
                    variant={stage === "ready" ? "default" : "outline"}
                    onClick={() => {
                      setReason(0);
                      setOpenId(item.id);
                    }}
                  >
                    {stage === "ready" ? v.publish : v.review}
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
        title={v.dialogTitle}
        description={open ? `${open.title} · ${open.ownerName} · ${open.ownerPhone}` : undefined}
        closeLabel={v.close}
        className="sm:w-[min(40rem,calc(100vw-2rem))]"
      >
        {open && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImageIcon className="size-4" />
              {v.photos(open.photos)}
            </div>

            {(["identity", "ownership"] as const).map((key) => {
              const Icon = key === "identity" ? UserCheck : FileText;
              const state = open.docs[key];
              return (
                <div key={key} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
                  <Icon className="size-5 text-primary-sage" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{key === "identity" ? v.identity : v.ownership}</p>
                    <DocPill state={state} label={v.docState[state]} />
                  </div>
                  {state !== "approved" && (
                    <div className="flex gap-2">
                      {state === "received" && (
                        <Button variant="outline" className="h-8 px-3" onClick={() => setDoc(open, key, "missing")}>
                          {v.requestDoc}
                        </Button>
                      )}
                      <Button className="h-8 px-3" disabled={state === "missing"} onClick={() => setDoc(open, key, "approved")}>
                        {v.approveDoc}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <CalendarCheck className="size-5 text-primary-sage" />
                <p className="flex-1 text-sm font-semibold">{v.visit}</p>
                {open.visit && (
                  <DocPill
                    state={open.visit.done ? "approved" : "received"}
                    label={open.visit.done ? v.visitDone(open.visit.inspector) : v.visitAt(`${date(open.visit.date, "MMM d")} ${open.visit.time}`, open.visit.inspector)}
                  />
                )}
              </div>
              {!open.visit && (
                <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                  <label className="flex flex-col gap-1 text-xs font-medium">
                    {v.inspector}
                    <select
                      value={visitDraft.inspector}
                      onChange={(e) => setVisitDraft((x) => ({ ...x, inspector: e.target.value }))}
                      className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                    >
                      {inspectors.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium">
                    {v.date}
                    <input
                      type="date"
                      value={visitDraft.date}
                      onChange={(e) => setVisitDraft((x) => ({ ...x, date: e.target.value }))}
                      className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium">
                    {v.time}
                    <select
                      value={visitDraft.time}
                      onChange={(e) => setVisitDraft((x) => ({ ...x, time: e.target.value }))}
                      className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                    >
                      {viewingTimes.map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <Button
                    className="h-9 px-3"
                    onClick={() => {
                      update(open.id, (i) => ({ ...i, visit: { ...visitDraft } }));
                      toast.success(tt.visitScheduled(`${date(visitDraft.date, "EEE, MMM d")} · ${visitDraft.time}`), {
                        description: `${visitDraft.inspector} · ${open.title}`,
                      });
                    }}
                  >
                    {v.schedule}
                  </Button>
                </div>
              )}
              {open.visit && !open.visit.done && (
                <Button
                  variant="outline"
                  className="mt-3 h-9 px-3"
                  onClick={() => {
                    update(open.id, (i) => ({ ...i, visit: { ...i.visit!, done: true } }));
                    toast.success(tt.visitDone, { description: open.title });
                  }}
                >
                  {v.markDone}
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-4">
              {stageOf(open) !== "ready" && <p className="text-sm text-muted-foreground">{v.needsAll}</p>}
              <div className="flex flex-wrap items-end justify-between gap-3">
                <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-medium">
                  {v.reason}
                  <select
                    value={reason}
                    onChange={(e) => setReason(Number(e.target.value))}
                    className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                  >
                    {v.reasons.map((r, i) => (
                      <option key={r} value={i}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-10 px-4"
                    onClick={() => {
                      setOpenId(null);
                      toast.info(tt.changesRequested(open.ownerName.split(" ")[0]), { description: v.reasons[reason] });
                    }}
                  >
                    {v.requestChanges}
                  </Button>
                  <Button
                    className="h-10 bg-accent-terracotta px-4 text-white hover:bg-terracotta-strong"
                    disabled={stageOf(open) !== "ready"}
                    onClick={() => publish(open)}
                  >
                    {v.publish}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
