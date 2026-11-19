"use client";

import { useState } from "react";
import Image from "next/image";
import { addDays, parseISO } from "date-fns";
import { CalendarCheck, Check, CircleDashed, Eye, EyeOff, FileText, ImageIcon, Lock, Trash2, UserCheck, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/toast";
import { useAudit } from "@/features/admin/audit";
import { useVerification } from "@/features/admin/verification-store";
import {
  currentStaff,
  DOC_RETENTION_DAYS,
  inspectors,
  type DocState,
  type StoredDoc,
  type VerificationItem,
  type VerificationStage,
} from "@/features/admin/data";
import { viewingTimes } from "@/features/viewings/data";
import { useI18n } from "@/i18n/client";
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
        (state === "missing" || state === "rejected") && "bg-destructive/10 text-destructive"
      )}
    >
      {state === "approved" ? <Check className="size-3" /> : state === "rejected" ? <X className="size-3" /> : <CircleDashed className="size-3" />}
      {label}
    </span>
  );
}

/**
 * Stand-in for the real file. A real build streams the file from private
 * storage through a short-lived signed URL, and only after the audit entry is written.
 */
function DocPreview({ doc, viewer, labels }: { doc: StoredDoc; viewer: string; labels: { watermark: string; sample: string } }) {
  return (
    <div className="relative mt-3 overflow-hidden rounded-xl border border-border bg-muted/50 p-4" aria-label={doc.name}>
      <div className="flex flex-col gap-2 opacity-60" aria-hidden>
        {[70, 90, 55, 80, 40, 85].map((w, i) => (
          <span key={i} className="h-2 rounded-full bg-foreground/20" style={{ width: `${w}%` }} />
        ))}
      </div>
      <p className="pointer-events-none absolute inset-0 grid place-items-center text-center text-xs font-semibold text-foreground/40 -rotate-12 select-none">
        {labels.watermark}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">{labels.sample}</p>
      <span className="sr-only">{viewer}</span>
    </div>
  );
}

export function VerificationQueue() {
  const { d, t, date, relative, money } = useI18n();
  const { log } = useAudit();
  const v = d.admin.verify;
  const tt = d.admin.toast;
  const { items, patch } = useVerification();
  const [filter, setFilter] = useState<VerificationStage | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [visitDraft, setVisitDraft] = useState({ inspector: inspectors[0], date: "2026-11-19", time: "10:30" });
  const [reason, setReason] = useState(0);
  const [published, setPublished] = useState<string[]>([]);
  /** Documents currently shown on screen, keyed "<item id>:<identity|ownership>". Closed again with the dialog. */
  const [revealed, setRevealed] = useState<string[]>([]);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const live = items.filter((i) => !published.includes(i.id));
  const shown = live.filter((i) => filter === "all" || stageOf(i) === filter);
  const open = items.find((i) => i.id === openId);

  const update = patch;

  const docLabel = (key: "identity" | "ownership") => (key === "identity" ? v.identity : v.ownership);
  const docDetail = (item: VerificationItem, key: "identity" | "ownership") =>
    [docLabel(key), item.files?.[key]?.name].filter(Boolean).join(" · ");

  function resetDocUi() {
    setRevealed([]);
    setRejecting(null);
    setDeleting(null);
  }

  function approveDoc(item: VerificationItem, key: "identity" | "ownership") {
    update(item.id, (i) => ({ ...i, docs: { ...i.docs, [key]: "approved" } }));
    log({ action: "doc.approved", target: item.title, ref: item.id, detail: docDetail(item, key) });
    toast.success(tt.docApproved, { description: `${item.title} · ${docLabel(key)}` });
  }

  function rejectDoc(item: VerificationItem, key: "identity" | "ownership") {
    const reason = v.docs.rejectReasons[rejectReason];
    update(item.id, (i) => ({
      ...i,
      docs: { ...i.docs, [key]: "rejected" },
      files: i.files?.[key] ? { ...i.files, [key]: { ...i.files[key]!, rejection: reason } } : i.files,
    }));
    log({ action: "doc.rejected", target: item.title, ref: item.id, detail: `${docLabel(key)} · ${reason}` });
    setRejecting(null);
    toast.warning(tt.docRejected, {
      description: `${item.ownerName.split(" ")[0]} · ${reason}`,
    });
  }

  function toggleReveal(item: VerificationItem, key: "identity" | "ownership") {
    const id = `${item.id}:${key}`;
    if (revealed.includes(id)) {
      setRevealed((r) => r.filter((x) => x !== id));
      return;
    }
    // Written before the file is shown: no way to look without leaving a trace.
    log({ action: "doc.viewed", target: item.title, ref: item.id, detail: docDetail(item, key) });
    setRevealed((r) => [...r, id]);
  }

  function deleteDoc(item: VerificationItem, key: "identity" | "ownership") {
    log({ action: "doc.deleted", target: item.title, ref: item.id, detail: docDetail(item, key) });
    update(item.id, (i) => ({ ...i, files: { ...i.files, [key]: undefined } }));
    setRevealed((r) => r.filter((x) => x !== `${item.id}:${key}`));
    setDeleting(null);
    toast.success(tt.docDeleted, { description: `${item.title} · ${docLabel(key)}` });
  }

  function publish(item: VerificationItem) {
    setPublished((p) => [...p, item.id]);
    log({ action: "verification.published", target: item.title, ref: item.id });
    resetDocUi();
    setOpenId(null);
    toast.success(tt.published, {
      description: item.title,
      action: {
        label: d.toast.undo,
        onClick: () => {
          setPublished((p) => p.filter((x) => x !== item.id));
          log({ action: "verification.unpublished", target: item.title, ref: item.id });
        },
      },
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
                    {d.propertyType[item.type]} · {t(item.district)} · {v.monthly(money(item.monthly))} · {item.ownerName}
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
                    className={cn("h-9 px-4", stage === "ready" && "bg-cta text-white hover:bg-cta-strong")}
                    variant={stage === "ready" ? "default" : "outline"}
                    onClick={() => {
                      setReason(0);
                      resetDocUi();
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
        onOpenChange={(o) => {
          if (!o) {
            resetDocUi();
            setOpenId(null);
          }
        }}
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
              const file = open.files?.[key];
              const id = `${open.id}:${key}`;
              const shownNow = revealed.includes(id);
              return (
                <div key={key} className="rounded-xl border border-border p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Icon className="size-5 text-primary-sage" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{docLabel(key)}</p>
                      <DocPill state={state} label={v.docState[state]} />
                    </div>
                    {state === "received" && rejecting !== id && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="h-8 px-3"
                          onClick={() => {
                            setRejectReason(0);
                            setRejecting(id);
                          }}
                        >
                          {v.docs.reject}
                        </Button>
                        <Button className="h-8 px-3" onClick={() => approveDoc(open, key)}>
                          {v.approveDoc}
                        </Button>
                      </div>
                    )}
                  </div>

                  {rejecting === id && (
                    <div className="mt-3 flex flex-wrap items-end gap-2">
                      <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-medium">
                        {v.docs.rejectReason}
                        <select
                          value={rejectReason}
                          onChange={(e) => setRejectReason(Number(e.target.value))}
                          className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                        >
                          {v.docs.rejectReasons.map((r, i) => (
                            <option key={r} value={i}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </label>
                      <Button variant="ghost" className="h-9 px-3" onClick={() => setRejecting(null)}>
                        {v.docs.cancel}
                      </Button>
                      <Button className="h-9 px-3" onClick={() => rejectDoc(open, key)}>
                        {v.docs.reject}
                      </Button>
                    </div>
                  )}

                  {state === "rejected" && file?.rejection && (
                    <p className="mt-2 text-xs font-medium text-destructive">{v.docs.rejected(file.rejection)}</p>
                  )}

                  {file ? (
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="font-medium">{v.docs.kind[file.kind]}</span>
                        <span className="min-w-0 truncate text-muted-foreground" lang="en">
                          {file.name} · {v.docs.size(file.sizeKb)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground" suppressHydrationWarning>
                        {v.docs.uploaded(relative(file.uploadedAt))} · {v.docs.deletesOn(date(addDays(parseISO(file.uploadedAt), DOC_RETENTION_DAYS), "MMM d, yyyy"))}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Button variant="outline" className="h-8 gap-1.5 px-3" aria-pressed={shownNow} onClick={() => toggleReveal(open, key)}>
                          {shownNow ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          {shownNow ? v.docs.hide : v.docs.open}
                        </Button>
                        {state !== "received" && deleting !== id && (
                          <Button
                            variant="ghost"
                            className="h-8 gap-1.5 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleting(id)}
                          >
                            <Trash2 className="size-4" />
                            {v.docs.delete}
                          </Button>
                        )}
                      </div>
                      {deleting === id && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-destructive/5 p-2.5 text-xs">
                          <p className="min-w-48 flex-1">{v.docs.deleteWarn}</p>
                          <Button variant="ghost" className="h-8 px-3" onClick={() => setDeleting(null)}>
                            {v.docs.cancel}
                          </Button>
                          <Button className="h-8 bg-destructive px-3 text-white hover:bg-destructive/90" onClick={() => deleteDoc(open, key)}>
                            {v.docs.confirmDelete}
                          </Button>
                        </div>
                      )}
                      {shownNow && (
                        <DocPreview doc={file} viewer={currentStaff.name} labels={{ watermark: v.docs.watermark(currentStaff.name), sample: v.docs.sample }} />
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">{state === "missing" ? v.docs.noFile : v.docs.fileDeleted}</p>
                  )}
                </div>
              );
            })}

            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5 shrink-0" />
              {v.docs.privacy}
            </p>

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
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
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
                      log({ action: "verification.visitScheduled", target: open.title, ref: open.id, detail: `${visitDraft.inspector} · ${visitDraft.date} ${visitDraft.time}` });
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
                    log({ action: "verification.visitDone", target: open.title, ref: open.id, detail: open.visit?.inspector });
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
                      log({ action: "verification.changesRequested", target: open.title, ref: open.id, detail: v.reasons[reason] });
                      resetDocUi();
                      setOpenId(null);
                      toast.info(tt.changesRequested(open.ownerName.split(" ")[0]), { description: v.reasons[reason] });
                    }}
                  >
                    {v.requestChanges}
                  </Button>
                  <Button
                    className="h-10 bg-cta px-4 text-white hover:bg-cta-strong"
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
