"use client";

import { useState } from "react";
import Link from "next/link";
import { addDays, format, parseISO } from "date-fns";
import { AlertCircle, Check, CreditCard, Landmark, QrCode, Smartphone } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { currentUser } from "@/features/account/current-user";
import { useActivity } from "@/features/renter/components/activity-provider";
import { useI18n } from "@/i18n/client";

import { cn } from "@/shared/lib/utils";

const methods = [
  { id: "khqr", icon: QrCode },
  { id: "aba", icon: Smartphone },
  { id: "bank", icon: Landmark },
  { id: "card", icon: CreditCard },
] as const;

function StepHeader({ n, title, done, active }: { n: number; title: string; done: boolean; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "grid size-7 place-items-center rounded-full text-xs font-semibold",
          done ? "bg-primary-sage text-white" : active ? "bg-dark-forest text-background" : "bg-muted text-muted-foreground"
        )}
      >
        {done ? <Check className="size-4" /> : n}
      </span>
      <h2 className={cn("font-semibold", !active && !done && "text-muted-foreground")}>{title}</h2>
    </div>
  );
}

export function BookingConfirm({
  listingId,
  ownerFirstName,
  listingTitle,
  moveIn,
  nights,
  guests,
  monthlyRent,
  rentTotal,
  dueAtBooking,
  blocked,
}: {
  listingId: string;
  ownerFirstName: string;
  listingTitle: string;
  moveIn: string;
  nights: number;
  guests: number;
  monthlyRent: number;
  rentTotal: number;
  dueAtBooking: number;
  /** The dates can't be booked (checked on the server); sending is disabled until they're changed. */
  blocked: boolean;
}) {
  const { d, money } = useI18n();
  const { addRequest } = useActivity();
  const c = d.checkout;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [purposeIndex, setPurposeIndex] = useState(0);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<(typeof methods)[number]["id"]>("khqr");

  if (step === 3) {
    const timeline = [
      { title: c.timeline.sent, body: c.timeline.sentBody(ownerFirstName), done: true },
      { title: c.timeline.responds(ownerFirstName), body: c.timeline.respondsBody, done: false },
      { title: c.timeline.pay, body: c.timeline.payBody(money(dueAtBooking), c.methods[method].label), done: false },
      { title: c.timeline.moveIn, body: c.timeline.moveInBody, done: false },
    ];
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-primary-sage">
          <Check className="size-6" />
        </span>
        <h2 className="mt-4 font-heading text-2xl font-semibold text-dark-forest">{c.sentTitle(ownerFirstName)}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {c.sentBody(listingTitle)}
        </p>
        <ol className="mt-6 flex flex-col">
          {timeline.map((t, i) => (
            <li key={t.title} className="relative flex gap-4 pb-6 last:pb-0">
              {i < timeline.length - 1 && <span className="absolute top-7 left-[13px] h-[calc(100%-1.75rem)] w-px bg-border" />}
              <span
                className={cn(
                  "relative grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                  t.done ? "bg-primary-sage text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {t.done ? <Check className="size-4" /> : i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-sm text-muted-foreground">{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button className="h-10 px-4" nativeButton={false} render={<Link href="/renter" />}>
            {c.goToStays}
          </Button>
          <Button variant="outline" className="h-10 px-4" nativeButton={false} render={<Link href="/messages" />}>
            {d.book.message(ownerFirstName)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <StepHeader n={1} title={c.step1} done={step > 1} active={step === 1} />
        {step === 1 ? (
          <form
            className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{c.fullName}</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-10" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{c.phone}</span>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" className="h-10" />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium">{c.reason}</span>
              <select
                value={purposeIndex}
                onChange={(e) => setPurposeIndex(Number(e.target.value))}
                className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {c.purposes.map((p, i) => (
                  <option key={p} value={i}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium">{c.messageTo(ownerFirstName)}</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder={c.messagePlaceholder(ownerFirstName)}
                className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <span className="text-xs text-muted-foreground">{c.messageHint}</span>
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" className="h-10 px-5">
                {d.common.continue}
              </Button>
            </div>
          </form>
        ) : (
          <p className="mt-2 pl-10 text-sm text-muted-foreground">
            {name} · {phone} · {c.purposes[purposeIndex]}
            <button type="button" onClick={() => setStep(1)} className="ml-2 font-medium text-foreground underline underline-offset-4">
              {d.common.edit}
            </button>
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <StepHeader n={2} title={c.step2} done={false} active={step === 2} />
        {step === 2 && (
          <div className="mt-5 flex flex-col gap-4">
            <div role="radiogroup" aria-label={c.paymentMethod} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {methods.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={method === id}
                  onClick={() => setMethod(id)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                    method === id ? "border-dark-forest bg-accent/50 ring-1 ring-dark-forest" : "border-border hover:border-foreground/30"
                  )}
                >
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary-sage" />
                  <span>
                    <span className="block text-sm font-semibold">{c.methods[id].label}</span>
                    <span className="block text-xs text-muted-foreground">{c.methods[id].hint}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="rounded-xl bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
              {c.nothingCharged(ownerFirstName, money(dueAtBooking))}
            </p>
            {blocked && (
              <p className="flex items-start gap-2 rounded-xl bg-warning/10 px-4 py-3 text-sm">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
                {c.fixDatesFirst}
              </p>
            )}
            <Button
              className="h-12 bg-accent-terracotta text-base text-white hover:bg-terracotta-strong sm:w-fit sm:px-8"
              disabled={blocked}
              onClick={() => {
                // Prototype: kept in this browser until booking requests go to the backend.
                addRequest({
                  listingId,
                  moveIn,
                  moveOut: format(addDays(parseISO(moveIn), nights), "yyyy-MM-dd"),
                  guests,
                  monthlyRent,
                  rentTotal,
                });
                setStep(3);
              }}
            >
              {c.send(ownerFirstName)}
            </Button>
            <p className="text-xs text-muted-foreground">
              {c.terms}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
