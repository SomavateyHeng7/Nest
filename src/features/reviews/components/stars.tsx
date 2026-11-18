"use client";

import { Star } from "lucide-react";

import { cn } from "@/shared/lib/utils";

/** Read-only row of five stars, filled up to the rounded value. The number is announced by `label`. */
export function Stars({ value, label, className }: { value: number; label: string; className?: string }) {
  const filled = Math.round(value);
  return (
    <span role="img" aria-label={label} className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} aria-hidden className={cn("size-4", n <= filled ? "fill-current text-accent-terracotta" : "text-border")} />
      ))}
    </span>
  );
}

/** Five tappable stars as a radio group. Arrow keys move between them. */
export function StarInput({
  value,
  onChange,
  label,
  optionLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  /** Accessible name for one choice, e.g. "3 out of 5". */
  optionLabel: (n: number) => string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={optionLabel(n)}
          tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
          onClick={() => onChange(n)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(5, (value || 0) + 1));
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(1, (value || 2) - 1));
          }}
          className="grid size-10 place-items-center rounded-lg outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 sm:size-9"
        >
          <Star className={cn("size-6", n <= value ? "fill-current text-accent-terracotta" : "text-border")} />
        </button>
      ))}
    </div>
  );
}
