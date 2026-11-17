"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addDays, startOfDay } from "date-fns";
import { Check, Eye, MapPin, Video } from "lucide-react";

import { useActivity } from "@/features/renter/components/activity-provider";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { viewingTimes } from "@/features/viewings/data";
import { useI18n } from "@/i18n/client";
import { toISODate } from "@/features/stays/components/stay-draft";
import { cn } from "@/shared/lib/utils";
import type { ViewingType } from "@/features/viewings/types";
import type { Listing } from "@/features/listings/types";

const DAYS_AHEAD = 10;

/** Deterministic mock of slots the owner already has taken. */
function isTaken(listingId: string, dateISO: string, time: string) {
  let h = 0;
  for (const ch of listingId + dateISO + time) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h % 4 === 0;
}

export function ViewingRequest({ listing }: { listing: Listing }) {
  const { d, date } = useI18n();
  const v = d.viewing;
  const { addViewing } = useActivity();
  const ownerFirst = listing.owner.name.split(" ")[0];

  const [open, setOpen] = useState(false);
  const [dayISO, setDayISO] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [type, setType] = useState<ViewingType>("in-person");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState<{ date: string; time: string } | null>(null);

  // Built when the dialog opens, so server and client never disagree on "today".
  const days = useMemo(() => {
    if (!open) return [];
    const tomorrow = addDays(startOfDay(new Date()), 1);
    return Array.from({ length: DAYS_AHEAD }, (_, i) => toISODate(addDays(tomorrow, i)));
  }, [open]);
  const activeDay = dayISO ?? days[0] ?? null;

  function reset() {
    setDayISO(null);
    setTime(null);
    setType("in-person");
    setNote("");
    setSent(null);
  }

  function submit() {
    if (!activeDay || !time) return;
    addViewing({ listingId: listing.id, date: activeDay, time, type, note: note.trim() || undefined });
    setSent({ date: activeDay, time });
  }

  return (
    <>
      <Button
        variant="outline"
        className="h-auto flex-col gap-0 py-2.5"
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Eye className="size-4" />
          {v.cta}
        </span>
        <span className="text-xs font-normal text-muted-foreground">{v.ctaHint}</span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={sent ? v.sentTitle : v.title}
        description={sent ? undefined : v.sub(ownerFirst)}
        closeLabel={v.close}
      >
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-accent text-primary-sage">
              <Check className="size-6" />
            </span>
            <p className="max-w-sm text-sm text-muted-foreground">
              {v.sentBody(v.at(date(sent.date, "EEE, MMM d"), sent.time), ownerFirst)}
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" className="h-10 px-4" onClick={() => setOpen(false)}>
                {v.done}
              </Button>
              <Button className="h-10 px-4" nativeButton={false} render={<Link href="/renter#viewings" />}>
                {v.seeMine}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <section>
              <h3 className="mb-2 text-sm font-semibold">{v.day}</h3>
              <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none" role="radiogroup" aria-label={v.day}>
                {days.map((iso) => (
                  <button
                    key={iso}
                    type="button"
                    role="radio"
                    aria-checked={activeDay === iso}
                    onClick={() => {
                      setDayISO(iso);
                      setTime(null);
                    }}
                    className={cn(
                      "flex w-16 shrink-0 flex-col items-center rounded-xl border py-2 transition-colors",
                      activeDay === iso
                        ? "border-dark-forest bg-dark-forest text-background"
                        : "border-border bg-card hover:border-foreground/30"
                    )}
                  >
                    <span className="text-xs opacity-80">{date(iso, "EEE")}</span>
                    <span className="text-lg font-semibold tabular">{date(iso, "d")}</span>
                    <span className="text-[11px] opacity-80">{date(iso, "MMM")}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold">{v.time}</h3>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={v.time}>
                {viewingTimes.map((slot) => {
                  const taken = activeDay ? isTaken(listing.id, activeDay, slot) : false;
                  return (
                    <button
                      key={slot}
                      type="button"
                      role="radio"
                      aria-checked={time === slot}
                      disabled={taken}
                      onClick={() => setTime(slot)}
                      className={cn(
                        "rounded-lg border py-2 text-sm font-medium tabular transition-colors disabled:cursor-not-allowed disabled:border-dashed disabled:text-muted-foreground/60",
                        time === slot ? "border-dark-forest bg-accent ring-1 ring-dark-forest" : "border-border bg-card hover:border-foreground/30"
                      )}
                    >
                      {taken ? <span className="line-through">{slot}</span> : slot}
                      {taken && <span className="sr-only"> — {v.unavailable}</span>}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold">{v.how}</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label={v.how}>
                {(["in-person", "video"] as const).map((key) => {
                  const Icon = key === "video" ? Video : MapPin;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={type === key}
                      onClick={() => setType(key)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                        type === key ? "border-dark-forest bg-accent/50 ring-1 ring-dark-forest" : "border-border bg-card hover:border-foreground/30"
                      )}
                    >
                      <Icon className="mt-0.5 size-4.5 shrink-0 text-primary-sage" />
                      <span>
                        <span className="block text-sm font-semibold">{v.types[key].label}</span>
                        <span className="block text-xs text-muted-foreground">{v.types[key].hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">
                {v.note} <span className="font-normal text-muted-foreground">({v.optional})</span>
              </span>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={v.notePlaceholder}
                className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </label>

            <div className="sticky -bottom-5 -mx-5 -mb-5 border-t border-border bg-popover px-5 py-4">
              <Button
                className="h-12 w-full bg-accent-terracotta text-base text-white hover:bg-terracotta-strong"
                disabled={!time}
                onClick={submit}
              >
                {time && activeDay ? `${v.submit} · ${v.at(date(activeDay, "EEE, MMM d"), time)}` : v.pickTime}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
