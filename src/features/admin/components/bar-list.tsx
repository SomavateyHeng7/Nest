"use client";

import { useState } from "react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  /** Optional secondary line under the label, e.g. "44% of previous step". */
  note?: string;
}

/**
 * Horizontal bar list for one series of magnitudes (funnel steps, stay-length
 * buckets). Single hue — identity comes from the row label, not colour. Bars
 * are anchored at the baseline with a 4px rounded data end; every bar carries
 * its value, so the tooltip only adds the share.
 */
export function BarList({
  title,
  sub,
  data,
  valueLabel,
  shareLabel,
  stepLabel,
  formatValue = (n) => n.toLocaleString("en-US"),
}: {
  title: string;
  sub?: string;
  data: BarDatum[];
  valueLabel: string;
  shareLabel: string;
  stepLabel: string;
  formatValue?: (n: number) => string;
}) {
  const { d } = useI18n();
  const [table, setTable] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...data.map((x) => x.value), 1);
  const total = data.reduce((s, x) => s + x.value, 0);
  // Funnel-style data carries its own step-to-step notes; share-of-total would mislead there.
  const hasNotes = data.some((x) => x.note);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{d.admin.sample}</span>
          <button
            type="button"
            onClick={() => setTable((v) => !v)}
            className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {table ? d.admin.asChart : d.admin.asTable}
          </button>
        </div>
      </div>

      {table ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-2 font-normal">{stepLabel}</th>
              <th className="py-2 text-right font-normal">{valueLabel}</th>
              <th className="py-2 text-right font-normal">{shareLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.key} className="border-b border-border/60 last:border-0">
                <td className="py-2">{row.label}</td>
                <td className="py-2 text-right tabular">{formatValue(row.value)}</td>
                <td className="py-2 text-right text-muted-foreground tabular">{hasNotes ? (row.note ?? "—") : `${Math.round((row.value / total) * 100)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((row) => {
            const pct = (row.value / max) * 100;
            const active = hover === row.key;
            return (
              <li
                key={row.key}
                className="relative"
                onPointerEnter={(e) => e.pointerType === "mouse" && setHover(row.key)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
                onClick={() => setHover(active ? null : row.key)}
              >
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span className={cn("truncate", active ? "text-foreground" : "text-muted-foreground")}>{row.label}</span>
                  <span className="shrink-0 font-semibold tabular">{formatValue(row.value)}</span>
                </div>
                {/* Hit target is the full row, taller than the 10px bar. */}
                <div className="relative h-2.5 rounded-r-[4px] bg-muted/60">
                  <div
                    className={cn("h-full rounded-r-[4px] bg-primary-sage transition-opacity", hover && !active && "opacity-50")}
                    style={{ width: `${Math.max(pct, 1.5)}%` }}
                  />
                </div>
                {row.note && <p className="mt-1 text-xs text-muted-foreground tabular">{row.note}</p>}
                {active && (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute -top-9 z-10 rounded-lg bg-foreground px-2.5 py-1.5 text-xs whitespace-nowrap text-background shadow-md"
                    style={{ left: `min(calc(${pct}% - 2rem), calc(100% - 9rem))` }}
                  >
                    {row.label}: <span className="font-semibold tabular">{formatValue(row.value)}</span>
                    {!hasNotes && <> · {Math.round((row.value / total) * 100)}%</>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
