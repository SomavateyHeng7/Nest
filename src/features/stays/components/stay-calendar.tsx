"use client";

import { useState } from "react";
import { differenceInCalendarDays, isAfter, isSameDay, isWithinInterval, parseISO, subDays } from "date-fns";
import { enUS, km } from "react-day-picker/locale";

import { toISODate, useStayDraft } from "@/features/stays/components/stay-draft";
import { Calendar } from "@/shared/ui/calendar";
import { useI18n } from "@/i18n/client";
import { nightsToStay } from "@/features/stays/lib/pricing";
import { cn } from "@/shared/lib/utils";

const pickerLocales = { en: enUS, km };

/**
 * Availability calendar that doubles as the date picker.
 *
 * First tap sets the move-in day, second tap sets the move-out day and the
 * stay length is derived from the two (tapping on or before move-in starts
 * over). The stay is drawn as one range from move-in to move-out; booked
 * nights are disabled and turn red when the chosen stay runs into them.
 */
export function StayCalendar({
  months = 2,
  onComplete,
  className,
}: {
  months?: 1 | 2;
  /** Called after the move-out day is picked. */
  onComplete?: () => void;
  className?: string;
}) {
  const { d, locale, date } = useI18n();
  const { listing, moveIn, setMoveIn, setStay, moveOut, lastNight, stay, problem } = useStayDraft();
  const [phase, setPhase] = useState<"start" | "end">("start");

  const availableFrom = parseISO(listing.availableFrom);
  const booked = listing.bookedRanges.map((r) => ({ from: parseISO(r.start), to: subDays(parseISO(r.end), 1) }));
  const bookingStarts = listing.bookedRanges.map((r) => parseISO(r.start));
  const start = moveIn ? parseISO(moveIn) : undefined;
  const selected = start && moveOut ? { from: start, to: moveOut } : undefined;

  const isBookedNight = (day: Date) => booked.some((b) => isWithinInterval(day, { start: b.from, end: b.to }));

  // A day another stay begins on is fine as a move-out day (you leave that morning).
  const disabled = (day: Date) => {
    if (day < availableFrom) return true;
    if (!isBookedNight(day)) return false;
    return !(phase === "end" && start && isAfter(day, start) && bookingStarts.some((s) => isSameDay(s, day)));
  };

  const isConflict = (day: Date) =>
    Boolean(start && lastNight) && isWithinInterval(day, { start: start!, end: lastNight! }) && isBookedNight(day);

  function handleDay(day: Date) {
    if (phase === "end" && start && isAfter(day, start)) {
      setStay(nightsToStay(differenceInCalendarDays(day, start)));
      setPhase("start");
      onComplete?.();
      return;
    }
    setMoveIn(toISODate(day));
    setPhase("end");
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className={cn("text-sm", phase === "end" ? "font-medium text-primary-sage" : "text-muted-foreground")} aria-live="polite">
          {phase === "end" ? d.listing.pickEnd : d.listing.pickStart}
        </p>
        {start && lastNight && (
          <p className={cn("text-sm font-medium", problem ? "text-destructive" : "text-foreground")}>
            {d.listing.selectedStay(date(start, "MMM d"), date(moveOut!, "MMM d, yyyy"), d.stay.format(stay))}
          </p>
        )}
      </div>
      <Calendar
        mode="range"
        numberOfMonths={months}
        // Outside days would repeat the stay range in two months at once.
        showOutsideDays={false}
        defaultMonth={start ?? availableFrom}
        selected={selected}
        onSelect={(_range, day) => handleDay(day)}
        disabled={disabled}
        modifiers={{ conflict: isConflict }}
        modifiersClassNames={{
          conflict:
            "!bg-destructive/20 [&>button]:!bg-transparent [&>button]:!text-destructive [&>button]:font-semibold [&>button]:line-through [&>button]:!opacity-100",
        }}
        locale={pickerLocales[locale]}
        className="w-full rounded-2xl border border-border bg-card p-3 [--cell-size:--spacing(9)]"
        classNames={{
          range_start: "rounded-l-(--cell-radius) bg-accent",
          range_middle: "rounded-none bg-accent [&>button]:!bg-transparent [&>button]:!text-accent-foreground",
          range_end: "rounded-r-(--cell-radius) bg-accent",
        }}
      />
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-primary" /> {d.listing.legendStay}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm border border-border bg-card" /> {d.listing.available}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-muted" /> {d.listing.unavailable}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-destructive/25" /> {d.listing.legendConflict}
        </span>
      </div>
    </div>
  );
}
