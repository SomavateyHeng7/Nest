"use client";

import { Minus, Plus } from "lucide-react";

import { useI18n } from "@/i18n/client";
import type { DurationUnit, StayLength } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const units: DurationUnit[] = ["days", "weeks", "months"];

// Days can go past 27 when picked as exact dates on the calendar (e.g. 45 days).
const maxFor: Record<DurationUnit, number> = { days: 365, weeks: 3, months: 12 };

export function StayLengthPicker({
  value,
  onChange,
  compact = false,
}: {
  value: StayLength;
  onChange: (value: StayLength) => void;
  compact?: boolean;
}) {
  const { d } = useI18n();
  const max = maxFor[value.unit];

  return (
    <div className={cn("flex items-center gap-2", compact ? "flex-row" : "flex-col items-stretch sm:flex-row sm:items-center")}>
      <div className="flex items-center rounded-lg border border-input bg-background">
        <button
          type="button"
          aria-label={d.stay.shorter}
          className="grid size-8 place-items-center rounded-l-lg text-muted-foreground hover:bg-muted disabled:opacity-40"
          disabled={value.amount <= 1}
          onClick={() => onChange({ ...value, amount: Math.max(1, value.amount - 1) })}
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-semibold tabular" aria-live="polite">
          {value.amount}
        </span>
        <button
          type="button"
          aria-label={d.stay.longer}
          className="grid size-8 place-items-center rounded-r-lg text-muted-foreground hover:bg-muted disabled:opacity-40"
          disabled={value.amount >= max}
          onClick={() => onChange({ ...value, amount: Math.min(max, value.amount + 1) })}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      <div role="radiogroup" aria-label={d.stay.unitGroup} className="flex rounded-lg bg-muted p-0.5">
        {units.map((u) => (
          <button
            key={u}
            type="button"
            role="radio"
            aria-checked={value.unit === u}
            onClick={() => onChange({ unit: u, amount: Math.min(value.amount, maxFor[u]) })}
            className={cn(
              "flex-1 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors",
              value.unit === u ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {d.stay.units[u]}
          </button>
        ))}
      </div>
    </div>
  );
}
