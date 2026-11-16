"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Minus, Plus, Star, X } from "lucide-react";

import { MAX_COMPARE, useCompare } from "@/features/compare/components/compare-provider";
import { StayLengthPicker } from "@/features/stays/components/stay-length-picker";
import { Button } from "@/shared/ui/button";
import { getListingById, isFullyVerified, listings } from "@/features/listings/data";
import { useI18n } from "@/i18n/client";
import { formatUSD, quoteStay, stayToNights, type StayLength } from "@/features/stays/lib/pricing";
import { cn } from "@/shared/lib/utils";
import type { Listing } from "@/features/listings/types";

const keyAmenities = ["Air conditioning", "Kitchen", "Washer", "Workspace", "Pool", "Gym", "Free parking", "24h security"];

function hasAmenity(l: Listing, a: string) {
  if (a === "Kitchen") return l.amenities.some((x) => x.toLowerCase().includes("kitchen"));
  return l.amenities.includes(a);
}

function Yes({ ok, labels }: { ok: boolean; labels: { yes: string; no: string } }) {
  return ok ? (
    <Check className="size-4.5 text-success" aria-label={labels.yes} />
  ) : (
    <Minus className="size-4.5 text-muted-foreground/50" aria-label={labels.no} />
  );
}

export function CompareTable() {
  const { d, t, date, lt } = useI18n();
  const c = d.compare;
  const { ids, remove, toggle, isFull } = useCompare();
  const [stay, setStay] = useState<StayLength>({ amount: 3, unit: "months" });
  const items = ids.map(getListingById).filter((l): l is Listing => l !== undefined);
  const nights = stayToNights(stay);

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
        <h1 className="font-heading text-3xl font-semibold text-dark-forest">{c.emptyTitle(MAX_COMPARE)}</h1>
        <p className="text-muted-foreground">{c.emptyBody}</p>
        <Button className="mt-3 h-10 px-5" nativeButton={false} render={<Link href="/listing" />}>
          {c.browse}
        </Button>
      </div>
    );
  }

  const totals = items.map((l) => quoteStay(l.pricing, nights).rentTotal);
  const cheapest = Math.min(...totals);
  const largest = Math.max(...items.map((l) => l.sizeSqm));
  const suggestions = listings.filter((l) => !ids.includes(l.id)).slice(0, 3);

  type Row = { label: string; render: (l: Listing, i: number) => React.ReactNode };
  const groups: { title: string; rows: Row[] }[] = [
    {
      title: c.groups.cost,
      rows: [
        {
          label: c.rows.total(d.stay.format(stay)),
          render: (_l, i) => (
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold tabular">{formatUSD(totals[i])}</span>
              {totals[i] === cheapest && items.length > 1 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">{c.lowest}</span>
              )}
            </span>
          ),
        },
        {
          label: c.rows.rate,
          render: (l) => {
            const q = quoteStay(l.pricing, nights);
            return d.rate[q.tier](formatUSD(q.rate));
          },
        },
        { label: c.rows.monthlyNightly, render: (l) => `${formatUSD(l.pricing.monthly)} · ${formatUSD(l.pricing.nightly)}` },
        { label: c.rows.deposit, render: (l) => formatUSD(quoteStay(l.pricing, nights).deposit) },
        { label: c.rows.included, render: (l) => l.utilitiesIncluded.map(t).join(", ") },
        { label: c.rows.electricity, render: (l) => t(l.electricity) },
        { label: c.rows.renterFee, render: () => <span className="font-medium text-success">$0</span> },
      ],
    },
    {
      title: c.groups.home,
      rows: [
        { label: c.rows.type, render: (l) => d.propertyType[l.type] },
        { label: c.rows.area, render: (l) => `${t(l.district)}, ${t(l.city)}` },
        {
          label: c.rows.size,
          render: (l) => (
            <span className="flex items-center gap-2">
              <span className="tabular">{l.sizeSqm} m²</span>
              {l.sizeSqm === largest && items.length > 1 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">{c.mostSpace}</span>
              )}
            </span>
          ),
        },
        { label: c.rows.bedsBaths, render: (l) => `${l.bedrooms === 0 ? d.card.studio : l.bedrooms} · ${l.baths}` },
        { label: c.rows.furnished, render: (l) => <Yes ok={l.furnished} labels={d.common} /> },
        { label: c.rows.availableFrom, render: (l) => date(l.availableFrom, "MMM d, yyyy") },
        { label: c.rows.stayLimits, render: (l) => c.stayLimits(l.minStayNights, l.maxStayMonths) },
      ],
    },
    {
      title: c.groups.trust,
      rows: [
        { label: c.rows.visited, render: (l) => <Yes ok={l.verification.inPersonVisit} labels={d.common} /> },
        { label: c.rows.ownership, render: (l) => <Yes ok={l.verification.ownership} labels={d.common} /> },
        {
          label: c.rows.rating,
          render: (l) => (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-current text-accent-terracotta" />
              <span className="tabular">{l.rating.toFixed(2)}</span>
              <span className="text-muted-foreground">({l.reviewCount})</span>
            </span>
          ),
        },
        { label: c.rows.ownerReplies, render: (l) => `${t(l.owner.responseTime)} · ${l.owner.responseRate}%` },
      ],
    },
    {
      title: c.groups.amenities,
      rows: keyAmenities.map((a) => ({ label: t(a), render: (l: Listing) => <Yes ok={hasAmenity(l, a)} labels={d.common} /> })),
    },
  ];

  const cols = `minmax(150px,200px) repeat(${items.length}, minmax(210px, 1fr))`;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-dark-forest">{c.title}</h1>
          <p className="text-sm text-muted-foreground">{c.sub}</p>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold">{c.stayLength}</span>
          <StayLengthPicker value={stay} onChange={setStay} compact />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
        <div className="min-w-fit">
          <div className="grid border-b border-border" style={{ gridTemplateColumns: cols }}>
            <div className="p-4" />
            {items.map((l) => (
              <div key={l.id} className="flex flex-col gap-3 border-l border-border p-4">
                <div className="relative aspect-4/3 overflow-hidden rounded-xl">
                  <Image src={l.images[0]} alt={lt(l).text} fill sizes="300px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    aria-label={c.remove(lt(l).text)}
                    className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-background/95 shadow-sm hover:bg-background"
                  >
                    <X className="size-4" />
                  </button>
                  {isFullyVerified(l) && (
                    <span className="absolute bottom-2 left-2 rounded-full bg-background/95 px-2 py-0.5 text-[11px] font-semibold text-dark-forest">
                      {d.verified.full}
                    </span>
                  )}
                </div>
                <Link href={`/listing/${l.id}`} lang={lt(l).lang} className="line-clamp-2 text-sm leading-snug font-semibold hover:underline">
                  {lt(l).text}
                </Link>
                <Button
                  className="mt-auto h-9 bg-accent-terracotta text-white hover:bg-terracotta-strong"
                  nativeButton={false}
                  render={<Link href={`/listing/${l.id}`} />}
                >
                  {c.viewBook}
                </Button>
              </div>
            ))}
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <div className="bg-muted/60 px-4 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                {g.title}
              </div>
              {g.rows.map((row) => (
                <div
                  key={row.label}
                  className="grid border-b border-border text-sm last:border-0"
                  style={{ gridTemplateColumns: cols }}
                >
                  <div className="px-4 py-3 text-muted-foreground">{row.label}</div>
                  {items.map((l, i) => (
                    <div key={l.id} className={cn("flex items-center border-l border-border px-4 py-3")}>
                      {row.render(l, i)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {!isFull && (
        <div className="mt-10">
          <h2 className="font-semibold">{c.addAnother}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {suggestions.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => toggle(l.id)}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 text-left hover:border-foreground/30"
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                  <Image src={l.images[0]} alt="" fill sizes="56px" className="object-cover" />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{lt(l).text}</span>
                  <span className="block text-xs text-muted-foreground">{formatUSD(l.pricing.monthly)} {d.common.perMonth}</span>
                </span>
                <Plus className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
