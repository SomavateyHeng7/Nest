"use client";

import { useState } from "react";

import { useI18n } from "@/i18n/client";
import { placementFeeTier } from "@/features/stays/lib/pricing";

export function FeeCalculator() {
  const { d, money } = useI18n();
  const c = d.owners.calc;
  const [rent, setRent] = useState(600);
  const [months, setMonths] = useState(3);

  const tier = placementFeeTier(months);
  const nestFee = Math.round(rent * tier.rate);
  const agentFee = rent;
  const totalRent = rent * months;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-black/[0.04] sm:p-8">
      <p className="font-semibold">{c.title}</p>
      <div className="mt-6 flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="flex items-baseline justify-between text-sm">
            <span className="font-medium">{c.rent}</span>
            <span className="text-lg font-semibold tabular">{money(rent)}</span>
          </span>
          <input
            type="range"
            min={150}
            max={2500}
            step={50}
            value={rent}
            onChange={(e) => setRent(Number(e.target.value))}
            className="accent-[var(--brand-forest)]"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="flex items-baseline justify-between text-sm">
            <span className="font-medium">{c.length}</span>
            <span className="text-lg font-semibold tabular">{d.common.months(months)}</span>
          </span>
          <input
            type="range"
            min={1}
            max={12}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="accent-[var(--brand-forest)]"
          />
        </label>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-accent/60 p-4">
          <p className="text-xs font-semibold text-accent-foreground">{c.nestFee}</p>
          <p className="mt-1 font-heading text-3xl font-semibold tabular">{money(nestFee)}</p>
          <p className="text-xs text-muted-foreground">{c.nestFeeHint(tier.rate * 100)}</p>
        </div>
        <div className="rounded-2xl bg-muted/70 p-4">
          <p className="text-xs font-semibold text-muted-foreground">{c.agent}</p>
          <p className="mt-1 font-heading text-3xl font-semibold text-muted-foreground tabular">{money(agentFee)}</p>
          <p className="text-xs text-muted-foreground">{c.agentHint}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-between border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">{c.keep}</span>
        <span className="font-semibold tabular">
          {money(totalRent - nestFee)} <span className="font-normal text-muted-foreground">{c.of(money(totalRent))}</span>
        </span>
      </div>
      {agentFee > nestFee && (
        <p className="mt-2 text-sm font-medium text-success">
          {c.more(money(agentFee - nestFee))}
        </p>
      )}
    </div>
  );
}
