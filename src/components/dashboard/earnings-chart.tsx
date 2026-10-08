"use client";

import { useState } from "react";

import type { MonthlyEarning } from "@/types/dashboard";

const CHART_HEIGHT = 160;

function niceMax(max: number) {
  return Math.ceil(max / 100) * 100 || 100;
}

export function EarningsChart({ data }: { data: MonthlyEarning[] }) {
  const [showTable, setShowTable] = useState(false);
  const max = niceMax(Math.max(...data.map((d) => d.amount)));
  const ticks = [max, max / 2, 0];
  const latestMonth = data[data.length - 1]?.month;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Monthly earnings</h3>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-xs font-medium text-primary-sage underline underline-offset-4"
        >
          {showTable ? "View as chart" : "View as table"}
        </button>
      </div>

      {showTable ? (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-1.5 font-normal">Month</th>
              <th className="py-1.5 font-normal">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.month} className="border-b border-border/60 last:border-0">
                <td className="py-1.5 text-foreground">{d.month}</td>
                <td className="py-1.5 text-foreground tabular-nums">${d.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <div className="mt-6 flex gap-4">
            <div
              className="flex w-8 shrink-0 flex-col justify-between text-right text-xs text-muted-foreground"
              style={{ height: CHART_HEIGHT }}
            >
              {ticks.map((t) => (
                <span key={t}>${t}</span>
              ))}
            </div>

            <div
              className="relative flex flex-1 gap-3 border-l border-border"
              style={{ height: CHART_HEIGHT }}
            >
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {ticks.map((t) => (
                  <div key={t} className="h-px w-full bg-border/60" />
                ))}
              </div>

              {data.map((d) => {
                const heightPct = (d.amount / max) * 100;
                const isLatest = d.month === latestMonth;
                return (
                  <div
                    key={d.month}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end"
                  >
                    {isLatest && (
                      <span
                        className="absolute left-1/2 mb-1 -translate-x-1/2 -translate-y-full text-xs font-medium text-foreground"
                        style={{ bottom: `${heightPct}%` }}
                      >
                        ${d.amount}
                      </span>
                    )}
                    <div
                      role="img"
                      aria-label={`${d.month}: $${d.amount}`}
                      className="pointer-events-none absolute left-1/2 mb-2 -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-2 py-1 text-xs whitespace-nowrap text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                      style={{ bottom: `${heightPct}%` }}
                    >
                      ${d.amount}
                    </div>
                    <div
                      className="w-full max-w-6 rounded-t-[4px] bg-primary-sage transition-opacity group-hover:opacity-80"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex gap-3 pl-[calc(2rem+1rem+1px)]">
            {data.map((d) => (
              <span key={d.month} className="flex-1 text-center text-xs text-muted-foreground">
                {d.month}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
