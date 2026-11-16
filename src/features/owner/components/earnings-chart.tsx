"use client";

import { useState } from "react";

import { useI18n } from "@/i18n/client";
import { formatUSD } from "@/features/stays/lib/pricing";
import type { MonthlyIncome } from "@/features/owner/types";

const CHART_HEIGHT = 200;

function niceMax(max: number) {
  const step = max > 1000 ? 500 : 100;
  return Math.ceil(max / step) * step || step;
}

export function EarningsChart({ data }: { data: MonthlyIncome[] }) {
  const { d, date } = useI18n();
  const c = d.income.chart;
  const monthLabel = (iso: string) => date(`${iso}-01`, "MMM");
  const [showTable, setShowTable] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const max = niceMax(Math.max(...data.map((m) => m.rent)));
  const ticks = [max, max / 2, 0];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">{c.title}</h3>
          <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-primary-sage" /> {c.payout}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-accent-terracotta" /> {c.fee}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {showTable ? c.asChart : c.asTable}
        </button>
      </div>

      {showTable ? (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="py-2 font-normal">{c.month}</th>
              <th className="py-2 text-right font-normal">{c.rent}</th>
              <th className="py-2 text-right font-normal">{c.feeCol}</th>
              <th className="py-2 text-right font-normal">{c.payoutCol}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m) => (
              <tr key={m.month} className="border-b border-border/60 last:border-0">
                <td className="py-2">{monthLabel(m.month)}</td>
                <td className="py-2 text-right tabular">{formatUSD(m.rent)}</td>
                <td className="py-2 text-right tabular">{m.fees ? `−${formatUSD(m.fees)}` : "—"}</td>
                <td className="py-2 text-right font-medium tabular">{formatUSD(m.rent - m.fees)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <div className="mt-6 flex gap-3">
            <div className="flex w-12 shrink-0 flex-col justify-between text-right text-xs text-muted-foreground tabular" style={{ height: CHART_HEIGHT }}>
              {ticks.map((t) => (
                <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
                  {formatUSD(t)}
                </span>
              ))}
            </div>
            <div className="relative flex flex-1 gap-3" style={{ height: CHART_HEIGHT }}>
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                {ticks.map((t) => (
                  <div key={t} className="h-px w-full bg-border" />
                ))}
              </div>
              {data.map((m) => {
                const net = m.rent - m.fees;
                const active = hover === m.month;
                return (
                  <div
                    key={m.month}
                    className="relative flex h-full flex-1 flex-col items-center justify-end"
                    onMouseEnter={() => setHover(m.month)}
                    onMouseLeave={() => setHover(null)}
                  >
                    {active && (
                      <div
                        className="absolute z-10 mb-2 w-max -translate-y-full rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md"
                        style={{ bottom: `${(m.rent / max) * 100}%` }}
                      >
                        <p className="font-semibold tabular">{c.tipPayout(formatUSD(net))}</p>
                        {m.fees > 0 && <p className="opacity-75 tabular">{c.tipFee(formatUSD(m.fees))}</p>}
                      </div>
                    )}
                    <div className="flex w-full max-w-10 flex-col overflow-hidden rounded-t-md" style={{ height: `${(m.rent / max) * 100}%` }}>
                      {m.fees > 0 && <div className="bg-accent-terracotta" style={{ height: `${(m.fees / m.rent) * 100}%` }} />}
                      <div className={active ? "flex-1 bg-primary-sage/80" : "flex-1 bg-primary-sage"} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 flex gap-3 pl-15">
            {data.map((m) => (
              <span key={m.month} className="flex-1 text-center text-xs text-muted-foreground">
                {monthLabel(m.month)}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
