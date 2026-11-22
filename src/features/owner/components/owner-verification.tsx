"use client";

import { useRef, useState } from "react";
import { Check, CircleDashed, FileText, Upload, UserCheck, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { currentUser } from "@/features/account/current-user";
import type { VerificationItem } from "@/features/admin/data";
import { useVerification, type DocKey } from "@/features/admin/verification-store";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "application/pdf"];

function DocRow({ itemId, docKey }: { itemId: string; docKey: DocKey }) {
  const { d, relative } = useI18n();
  const v = d.admin.verify;
  const o = d.ownerVerify;
  const store = useVerification();
  const item = store.items.find((i) => i.id === itemId)!;
  const state = item.docs[docKey];
  const file = item.files?.[docKey];
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const Icon = docKey === "identity" ? UserCheck : FileText;

  function pick(f: File | undefined) {
    if (!f) return;
    if (!OK_TYPES.includes(f.type)) return setError(o.wrongType);
    if (f.size > MAX_BYTES) return setError(o.tooBig);
    setError(null);
    store.reupload(itemId, docKey, { name: f.name, sizeKb: Math.max(1, Math.round(f.size / 1024)) });
    toast.success(o.sent, { description: o.sentBody });
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border p-3">
      <div className="flex flex-wrap items-center gap-3">
        <Icon className="size-5 text-primary-sage" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{docKey === "identity" ? v.identity : v.ownership}</p>
          {file && (
            <p className="truncate text-xs text-muted-foreground" lang="en">
              {file.name} · {v.docs.size(file.sizeKb)} · <span suppressHydrationWarning>{relative(file.uploadedAt)}</span>
            </p>
          )}
        </div>
        <span
          className={cn(
            "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-semibold",
            state === "approved" && "bg-success/15 text-success",
            state === "received" && "bg-warning/15 text-warning",
            (state === "missing" || state === "rejected") && "bg-destructive/10 text-destructive"
          )}
        >
          {state === "approved" ? <Check className="size-3" /> : state === "rejected" ? <X className="size-3" /> : <CircleDashed className="size-3" />}
          {state === "received" ? o.waiting : v.docState[state]}
        </span>
        {(state === "rejected" || state === "missing") && (
          <>
            <Button className="h-9 gap-1.5 px-3" onClick={() => input.current?.click()}>
              <Upload className="size-4" />
              {state === "rejected" ? o.upload : o.uploadFirst}
            </Button>
            <input ref={input} type="file" accept="image/jpeg,image/png,application/pdf" className="sr-only" tabIndex={-1} aria-label={o.upload} onChange={(e) => pick(e.target.files?.[0])} />
          </>
        )}
      </div>
      {state === "rejected" && file?.rejection && <p className="text-xs font-medium text-destructive">{o.why(file.rejection)}</p>}
      {(state === "rejected" || state === "missing") && <p className={cn("text-xs", error ? "font-medium text-destructive" : "text-muted-foreground")}>{error ?? o.hint}</p>}
    </li>
  );
}

/** Where a listing is on the way to going live: documents, a visit booked, the visit done, ready for staff to publish. */
function Progress({ item }: { item: VerificationItem }) {
  const { d, date } = useI18n();
  const o = d.ownerVerify;
  const docsOk = item.docs.identity === "approved" && item.docs.ownership === "approved";
  const steps = [
    { label: o.steps.docs, done: docsOk },
    { label: item.visit && !item.visit.done ? o.steps.visitBooked(date(item.visit.date, "MMM d"), item.visit.time) : o.steps.visit, done: Boolean(item.visit) },
    { label: o.steps.visitDone, done: Boolean(item.visit?.done) },
    { label: o.steps.ready, done: docsOk && Boolean(item.visit?.done) },
  ];
  const current = steps.findIndex((s) => !s.done);
  return (
    <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={o.progress}>
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-2 text-xs" aria-current={i === current ? "step" : undefined}>
          <span
            className={cn(
              "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border text-[10px] font-semibold",
              s.done ? "border-success bg-success text-white" : i === current ? "border-dark-forest text-dark-forest" : "border-border text-muted-foreground"
            )}
          >
            {s.done ? <Check className="size-3" aria-hidden /> : i + 1}
          </span>
          <span className={cn(s.done || i === current ? "font-medium text-foreground" : "text-muted-foreground")}>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

/** The owner's own verification documents. Rejected ones can be uploaded again here. */
export function OwnerVerification() {
  const { d } = useI18n();
  const o = d.ownerVerify;
  const store = useVerification();
  const mine = store.forOwner(currentUser.name);
  if (mine.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-semibold">{o.title}</h2>
      <p className="text-sm text-muted-foreground">{o.sub}</p>
      <ul className="mt-3 flex flex-col gap-4">
        {mine.map((item) => (
          <li key={item.id} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-medium" lang="en">
              {item.title}
            </p>
            <Progress item={item} />
            <ul className="mt-4 flex flex-col gap-2">
              <DocRow itemId={item.id} docKey="identity" />
              <DocRow itemId={item.id} docKey="ownership" />
            </ul>
            {item.docs.identity === "approved" && item.docs.ownership === "approved" && (
              <p className="mt-3 text-sm text-muted-foreground">
                {o.allGood} {o.allGoodVisit}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
