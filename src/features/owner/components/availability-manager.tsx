"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { useI18n } from "@/i18n/client";
import { formatUSD } from "@/features/stays/lib/pricing";
import { cn } from "@/shared/lib/utils";
import type { OwnerBooking } from "@/features/booking/types";
import type { Listing } from "@/features/listings/types";

type DayState = "past" | "booked" | "blocked" | "open";
type DragMode = "block" | "unblock";

interface DayInfo {
  date: Date;
  state: DayState;
  booking?: OwnerBooking;
  /** Shown state while dragging, if this day is inside the drag range. */
  preview?: DragMode;
}

const iso = (d: Date) => format(d, "yyyy-MM-dd");

/** Key that decides which days join into one continuous bar. */
function runKey(day: DayInfo | null) {
  if (!day) return null;
  if (day.preview) return `preview:${day.preview}`;
  if (day.state === "booked") return `booked:${day.booking?.id}`;
  if (day.state === "blocked") return "blocked";
  return null;
}

function MonthGrid({
  month,
  info,
  onDayPointerDown,
  onDayKeyToggle,
}: {
  month: Date;
  info: (d: Date) => DayInfo;
  onDayPointerDown: (d: Date, e: React.PointerEvent) => void;
  onDayKeyToggle: (d: Date) => void;
}) {
  const { d: dict, date } = useI18n();
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const offset = (getDay(days[0]) + 6) % 7; // Monday-first
  const cells: (DayInfo | null)[] = [...Array.from({ length: offset }, () => null), ...days.map(info)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  return (
    <div>
      <p className="mb-3 font-semibold">{date(month, "MMMM yyyy")}</p>
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
        {dict.calendar.weekdays.map((wd) => (
          <span key={wd} className="py-1">
            {wd}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1">
        {weeks.map((week, w) => (
          <div key={w} className="grid grid-cols-7">
            {week.map((day, i) => {
              if (!day) return <span key={i} />;
              const key = runKey(day);
              const startsRun = key !== null && runKey(week[i - 1] ?? null) !== key;
              const endsRun = key !== null && runKey(week[i + 1] ?? null) !== key;
              let runLength = 0;
              if (startsRun) while (i + runLength < 7 && runKey(week[i + runLength]) === key) runLength++;

              const booking = day.booking;
              const firstOfBooking = booking && iso(day.date) === booking.moveIn;
              const label = startsRun && day.state === "booked" && !day.preview && booking ? booking.renterName.split(" ")[0] : null;
              const interactive = day.state !== "past" && day.state !== "booked";

              return (
                <button
                  key={i}
                  type="button"
                  data-owner-day={iso(day.date)}
                  disabled={!interactive}
                  onPointerDown={(e) => interactive && onDayPointerDown(day.date, e)}
                  // Keyboard activation (pointer clicks are handled on pointer down/up).
                  onClick={(e) => e.detail === 0 && interactive && onDayKeyToggle(day.date)}
                  title={booking ? booking.renterName : day.state === "blocked" ? dict.calendar.blockedByYou : dict.calendar.open}
                  aria-pressed={day.state === "blocked"}
                  className="group relative h-12 text-sm font-medium tabular outline-none select-none focus-visible:z-20"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0.5 inset-x-0",
                      startsRun && "left-0.5 rounded-l-lg",
                      endsRun && "right-0.5 rounded-r-lg",
                      !key && day.state === "open" && "inset-x-0.5 rounded-lg bg-card ring-1 ring-border group-hover:ring-foreground/40",
                      day.preview === "block" && "bg-accent-terracotta/25",
                      day.preview === "unblock" && "bg-card ring-1 ring-accent-terracotta/60 ring-inset",
                      !day.preview && day.state === "booked" && "bg-primary-sage",
                      !day.preview &&
                        day.state === "blocked" &&
                        "bg-[repeating-linear-gradient(135deg,var(--muted)_0_4px,transparent_4px_8px)] ring-1 ring-border ring-inset",
                      "group-focus-visible:ring-3 group-focus-visible:ring-ring/50"
                    )}
                  />
                  <span
                    className={cn(
                      "relative",
                      day.state === "past" && "text-muted-foreground/40",
                      !day.preview && day.state === "booked" && "text-white",
                      !day.preview && day.state === "blocked" && "text-muted-foreground line-through"
                    )}
                  >
                    {format(day.date, "d")}
                  </span>
                  {label && (
                    <span
                      className="pointer-events-none absolute bottom-1 left-1.5 z-10 truncate text-left text-[10px] leading-none font-semibold text-white/90"
                      style={{ width: `calc(${runLength * 100}% - 0.75rem)` }}
                    >
                      {firstOfBooking ? "→ " : ""}
                      {label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AvailabilityManager({ listings, bookings }: { listings: Listing[]; bookings: OwnerBooking[] }) {
  const { d, t, date, lt } = useI18n();
  const c = d.calendar;
  const [listingId, setListingId] = useState(listings[0]?.id);
  const [start, setStart] = useState(() => startOfMonth(new Date()));
  const [blocked, setBlocked] = useState<Record<string, Set<string>>>({});
  const [minNights, setMinNights] = useState<Record<string, number>>({});

  const listing = listings.find((l) => l.id === listingId)!;
  const today = startOfDay(new Date());
  const listingBookings = useMemo(
    () => bookings.filter((b) => b.listingId === listingId && (b.status === "confirmed" || b.status === "active")),
    [bookings, listingId]
  );
  const blockedSet = blocked[listingId] ?? new Set<string>();

  const bookingFor = (d: Date) =>
    listingBookings.find((b) => isWithinInterval(d, { start: parseISO(b.moveIn), end: subDays(parseISO(b.moveOut), 1) }));

  const stateFor = (d: Date): DayState => {
    if (isBefore(d, today)) return "past";
    if (bookingFor(d)) return "booked";
    if (blockedSet.has(iso(d))) return "blocked";
    return "open";
  };

  // --- Drag to block / unblock a range ------------------------------------
  const [drag, setDrag] = useState<{ anchor: Date; current: Date; mode: DragMode } | null>(null);
  const dragRef = useRef(drag);
  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  const inDrag = (d: Date) => {
    if (!drag) return false;
    const [a, b] = drag.anchor <= drag.current ? [drag.anchor, drag.current] : [drag.current, drag.anchor];
    return isWithinInterval(d, { start: a, end: b });
  };

  function applyRange(a: Date, b: Date, mode: DragMode) {
    const [from, to] = a <= b ? [a, b] : [b, a];
    setBlocked((prev) => {
      const next = new Set(prev[listingId] ?? []);
      for (const day of eachDayOfInterval({ start: from, end: to })) {
        if (isBefore(day, today) || bookingFor(day)) continue; // never touch past or booked nights
        if (mode === "block") next.add(iso(day));
        else next.delete(iso(day));
      }
      return { ...prev, [listingId]: next };
    });
  }

  function startDrag(day: Date, e: React.PointerEvent) {
    e.preventDefault();
    setDrag({ anchor: day, current: day, mode: blockedSet.has(iso(day)) ? "unblock" : "block" });
  }

  useEffect(() => {
    if (!drag) return;
    // Track the pointer over day cells via hit-testing, which also works for
    // touch (where pointerenter doesn't fire on other elements mid-gesture).
    const onMove = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-owner-day]");
      const value = el?.dataset.ownerDay;
      if (!value) return;
      setDrag((cur) => (cur && iso(cur.current) !== value ? { ...cur, current: parseISO(value) } : cur));
    };
    const onUp = () => {
      const cur = dragRef.current;
      if (cur) applyRange(cur.anchor, cur.current, cur.mode);
      setDrag(null);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-subscribe only when a drag starts/ends
  }, [drag !== null]);

  const info = (day: Date): DayInfo => {
    const state = stateFor(day);
    const booking = state === "booked" ? bookingFor(day) : undefined;
    const preview = drag && state !== "past" && state !== "booked" && inDrag(day) ? drag.mode : undefined;
    return { date: day, state, booking, preview };
  };

  const months = [start, addMonths(start, 1)];

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      <aside className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          {listings.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setListingId(l.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                l.id === listingId ? "border-dark-forest bg-accent/50 ring-1 ring-dark-forest" : "border-border bg-card hover:border-foreground/30"
              )}
            >
              <p className="truncate text-sm font-semibold" lang={lt(l).lang}>{lt(l).text}</p>
              <p className="text-xs text-muted-foreground">
                {t(l.district)} · {d.owner.perMonthShort(formatUSD(l.pricing.monthly))}
              </p>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">{c.rules}</p>
          <label className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{c.minNights}</span>
            <input
              type="number"
              min={1}
              max={90}
              value={minNights[listingId] ?? listing.minStayNights}
              onChange={(e) => setMinNights((m) => ({ ...m, [listingId]: Number(e.target.value) }))}
              className="w-16 rounded-md border border-input bg-transparent px-2 py-1 text-right tabular"
            />
          </label>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{c.maxStay}</span>
            <span className="font-medium">{d.common.months(listing.maxStayMonths)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{c.nightlyMonthly}</span>
            <span className="font-medium tabular">
              {formatUSD(listing.pricing.nightly)} · {formatUSD(listing.pricing.monthly)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="size-3.5 rounded bg-primary-sage" /> {c.legendBooked}
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3.5 rounded bg-[repeating-linear-gradient(135deg,var(--muted)_0_3px,transparent_3px_6px)] ring-1 ring-border" />
            {c.legendBlocked}
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3.5 rounded bg-card ring-1 ring-border" /> {c.legendOpen}
          </span>
        </div>
      </aside>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" aria-label={c.prev} onClick={() => setStart((s) => addMonths(s, -1))} disabled={isSameMonth(start, today)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label={c.next} onClick={() => setStart((s) => addMonths(s, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {blockedSet.size > 0 ? (
              <>
                <Lock className="size-4" />
                {c.blockedCount(blockedSet.size)}
                <button
                  type="button"
                  className="ml-1 flex items-center gap-1 font-medium text-foreground underline underline-offset-4"
                  onClick={() => setBlocked((p) => ({ ...p, [listingId]: new Set() }))}
                >
                  <Unlock className="size-3.5" />
                  {d.common.clear}
                </button>
              </>
            ) : (
              c.allOpen
            )}
          </div>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">{c.dragHint}</p>
        {/* touch-none: dragging across days must not scroll the page */}
        <div className="grid touch-none gap-8 md:grid-cols-2">
          {months.map((m) => (
            <MonthGrid
              key={m.toISOString()}
              month={m}
              info={info}
              onDayPointerDown={startDrag}
              onDayKeyToggle={(day) => applyRange(day, day, blockedSet.has(iso(day)) ? "unblock" : "block")}
            />
          ))}
        </div>

        {listingBookings.length > 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm font-semibold">{c.confirmed}</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm">
              {listingBookings.map((b) => (
                <li key={b.id} className="flex justify-between text-muted-foreground">
                  <span className="flex items-center gap-2 text-foreground">
                    <span className="size-2.5 rounded-sm bg-primary-sage" />
                    {b.renterName}
                  </span>
                  <span className="tabular">
                    {date(b.moveIn, "MMM d")} – {date(b.moveOut, "MMM d, yyyy")} ·{" "}
                    {c.nightsShort(differenceInCalendarDays(parseISO(b.moveOut), parseISO(b.moveIn)))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
