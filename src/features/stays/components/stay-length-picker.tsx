"use client";

import { Minus, Plus } from "lucide-react";

import { useI18n } from "@/i18n/client";
import type { DurationUnit, StayLength } from "@/features/stays/lib/pricing";
import { cn } from "@/shared/lib/utils";

const units: DurationUnit[] = ["days", "weeks", "months"];

// Days can go past 27 when picked as exact dates on the calendar (e.g. 45 days).
const maxFor: Record<DurationUnit, number> = { days: 365, weeks: 3, months: 12 };

export function StayLengthPicker({
  value,
  onChange,
  compact = false,
  size = "default",
}: {
  value: StayLength;
  onChange: (value: StayLength) => void;
  compact?: boolean;
  /** `lg`: form-field height with a filled selected unit, for prominent forms like the home search. */
  size?: "default" | "lg";
}) {
  const { d } = useI18n();
  const max = maxFor[value.unit];
  const lg = size === "lg";

  const stepClass = lg
    ? "grid size-12 place-items-center text-foreground hover:bg-muted disabled:opacity-40"
    : "grid size-10 place-items-center sm:size-8 text-muted-foreground hover:bg-muted disabled:opacity-40";

  return (
    <div
      className={cn(
        "flex gap-2",
        lg
          ? "flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:items-center"
          : compact
            ? "flex-row flex-wrap items-center"
            : "flex-col items-stretch sm:flex-row sm:items-center"
      )}
    >
      <div
        className={cn(
          "flex items-center border border-input bg-background",
          lg ? "h-12 shrink-0 justify-between rounded-xl shadow-xs" : "rounded-lg"
        )}
      >
        <button
          type="button"
          aria-label={d.stay.shorter}
          className={cn(stepClass, lg ? "rounded-l-xl" : "rounded-l-lg")}
          disabled={value.amount <= 1}
          onClick={() => onChange({ ...value, amount: Math.max(1, value.amount - 1) })}
        >
          <Minus className={lg ? "size-4" : "size-3.5"} />
        </button>
        <span className={cn("text-center font-semibold tabular", lg ? "w-10 text-base" : "w-8 text-sm")} aria-live="polite">
          {value.amount}
        </span>
        <button
          type="button"
          aria-label={d.stay.longer}
          className={cn(stepClass, lg ? "rounded-r-xl" : "rounded-r-lg")}
          disabled={value.amount >= max}
          onClick={() => onChange({ ...value, amount: Math.min(max, value.amount + 1) })}
        >
          <Plus className={lg ? "size-4" : "size-3.5"} />
        </button>
      </div>
      <div
        role="radiogroup"
        aria-label={d.stay.unitGroup}
        className={cn(
          "flex",
          lg ? "h-12 gap-1 rounded-xl min-[420px]:flex-1 border border-input bg-background p-1 shadow-xs" : "rounded-lg bg-muted p-0.5"
        )}
      >
        {units.map((u) => {
          const checked = value.unit === u;
          return (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange({ unit: u, amount: Math.min(value.amount, maxFor[u]) })}
              className={cn(
                "flex-1 font-medium whitespace-nowrap transition-colors",
                lg
                  ? cn(
                      "rounded-lg px-3 text-sm",
                      checked ? "bg-accent text-accent-foreground ring-1 ring-primary-sage/40" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  : cn(
                      "rounded-md px-3 py-2.5 text-xs sm:px-2.5 sm:py-1",
                      checked ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )
              )}
            >
              {d.stay.units[u]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
