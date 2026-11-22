"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, List, Map as MapIcon, SlidersHorizontal, X } from "lucide-react";

import { ListingCard } from "@/features/listings/components/listing-card";
import { ResultsMap } from "@/features/listings/components/listing-map";
import { StayLengthPicker } from "@/features/stays/components/stay-length-picker";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { isFullyVerified } from "@/features/listings/data";
import { useReviews } from "@/features/reviews/store";
import { useI18n } from "@/i18n/client";
import { ANYWHERE, areas, cities, propertyTypes } from "@/features/listings/lib/destinations";
import {
  BUDGET_MAX,
  BUDGET_MIN,
  parseBrowseParams,
  serializeBrowseParams,
  RATING_STEPS,
  type BrowserFilters,
  type BrowseView,
  type Sort,
} from "@/features/listings/lib/browse-params";
import { stayProblem } from "@/features/stays/lib/availability";
import { quoteStay, stayToNights } from "@/features/stays/lib/pricing";
import { cn } from "@/shared/lib/utils";
import type { Listing } from "@/features/listings/types";

/** Same rules as checkout; with no move-in date picked, any start date is fine. */
function fitsDates(listing: Listing, moveIn: string, nights: number) {
  const problem = stayProblem(listing, moveIn, nights);
  return !problem || problem.kind === "noDate";
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2.5 text-sm font-medium transition-colors sm:px-3 sm:py-1.5",
        active
          ? "border-dark-forest bg-dark-forest text-background"
          : "border-border bg-card text-foreground hover:border-foreground/30"
      )}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-input transition-colors peer-checked:bg-primary-sage peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4"
      />
    </label>
  );
}

/** How long the URL waits for filters to settle (e.g. while dragging the budget slider). */
const URL_WRITE_DELAY_MS = 300;

export function ListingBrowser({ listings }: { listings: Listing[] }) {
  const { d, t, date, money } = useI18n();
  const reviews = useReviews();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.toString();
  const [initial] = useState(() => parseBrowseParams(Object.fromEntries(searchParams)));
  const [filters, setFilters] = useState<BrowserFilters>(initial.filters);
  const [sort, setSort] = useState<Sort>(initial.sort);
  const [view, setView] = useState<BrowseView>(initial.view);
  const [showFilters, setShowFilters] = useState(false);

  const stateQuery = serializeBrowseParams(filters, sort, view);
  const stateQueryRef = useRef(stateQuery);
  useEffect(() => {
    stateQueryRef.current = stateQuery;
  });

  // The URL is the source of truth when it changes from outside this component
  // (a navbar or footer search link, Back/Forward): load the search it describes.
  // Our own writes below already match the state, so they're skipped.
  useEffect(() => {
    if (urlQuery === stateQueryRef.current) return;
    const next = parseBrowseParams(Object.fromEntries(new URLSearchParams(urlQuery)));
    setFilters(next.filters);
    setSort(next.sort);
    setView(next.view);
  }, [urlQuery]);

  // Mirror the search into the URL so it can be shared, bookmarked and survives
  // a reload. replaceState updates the address without a server round trip, and
  // is debounced because Safari throws after ~100 history calls in 10 seconds.
  useEffect(() => {
    if (stateQuery === urlQuery) return;
    const timer = window.setTimeout(() => {
      const url = stateQuery ? `${window.location.pathname}?${stateQuery}` : window.location.pathname;
      window.history.replaceState(null, "", url);
    }, URL_WRITE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [stateQuery, urlQuery]);

  const set = <K extends keyof BrowserFilters>(key: K, value: BrowserFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const nights = stayToNights(filters.stay);
  const districts = areas.find((a) => a.city === filters.city)?.districts ?? [];

  const total = useCallback((l: Listing) => quoteStay(l.pricing, nights).rentTotal, [nights]);

  const results = useMemo(() => {
    const filtered = listings.filter((l) => {
      if (filters.city !== ANYWHERE && l.city !== filters.city) return false;
      if (filters.district && l.district !== filters.district) return false;
      if (filters.types.length && !filters.types.includes(l.type)) return false;
      if (filters.maxMonthly < BUDGET_MAX && l.pricing.monthly > filters.maxMonthly) return false;
      if (l.bedrooms < filters.minBedrooms) return false;
      if (filters.billsIncluded && l.electricity !== "Included") return false;
      if (filters.fullyVerifiedOnly && !isFullyVerified(l)) return false;
      if (filters.furnishedOnly && !l.furnished) return false;
      if (filters.petsOnly && !l.livability.petsAllowed) return false;
      if (filters.stepFreeOnly && !l.livability.stepFree) return false;
      if (filters.quietOnly && l.livability.noise !== "quiet") return false;
      if (filters.minRating > 0 && reviews.summary(l.id).average < filters.minRating) return false;
      return fitsDates(l, filters.moveIn, nights);
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return total(a) - total(b);
      if (sort === "price-desc") return total(b) - total(a);
      if (sort === "available") return a.availableFrom.localeCompare(b.availableFrom);
      const ra = reviews.summary(a.id);
      const rb = reviews.summary(b.id);
      // Top rated: best average first, and among equals the one with more reviews.
      if (sort === "rating") return rb.average - ra.average || rb.count - ra.count;
      return Number(isFullyVerified(b)) - Number(isFullyVerified(a)) || rb.average - ra.average || rb.count - ra.count;
    });
  }, [listings, filters, nights, sort, total, reviews]);

  const activeCount =
    filters.types.length +
    Number(filters.maxMonthly < BUDGET_MAX) +
    Number(filters.minBedrooms > 0) +
    Number(filters.billsIncluded) +
    Number(filters.fullyVerifiedOnly) +
    Number(filters.furnishedOnly) +
    Number(filters.petsOnly) +
    Number(filters.stepFreeOnly) +
    Number(filters.quietOnly) +
    Number(filters.minRating > 0) +
    Number(Boolean(filters.district));

  function reset() {
    setFilters((f) => ({
      ...f,
      district: "",
      types: [],
      maxMonthly: BUDGET_MAX,
      minBedrooms: 0,
      billsIncluded: false,
      fullyVerifiedOnly: false,
      furnishedOnly: false,
      petsOnly: false,
      stepFreeOnly: false,
      quietOnly: false,
      minRating: 0,
    }));
  }

  const panel = (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{d.browse.propertyType}</h3>
        <div className="flex flex-wrap gap-2">
          {propertyTypes.map((pt) => (
            <Chip
              key={pt}
              active={filters.types.includes(pt)}
              onClick={() =>
                set("types", filters.types.includes(pt) ? filters.types.filter((x) => x !== pt) : [...filters.types, pt])
              }
            >
              {d.propertyType[pt]}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold">{d.browse.budget}</h3>
          <span className="text-sm text-muted-foreground tabular">
            {filters.maxMonthly >= BUDGET_MAX ? d.browse.budgetAny : d.browse.budgetUpTo(money(filters.maxMonthly))}
          </span>
        </div>
        <input
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={50}
          value={filters.maxMonthly}
          onChange={(e) => set("maxMonthly", Number(e.target.value))}
          className="w-full accent-[var(--brand-forest)]"
          aria-label={d.browse.budgetAria}
        />
        <div className="flex justify-between text-xs text-muted-foreground tabular">
          <span>{money(BUDGET_MIN)}</span>
          <span>{money(BUDGET_MAX)}+</span>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{d.browse.bedrooms}</h3>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((n) => (
            <Chip key={n} active={filters.minBedrooms === n} onClick={() => set("minBedrooms", n)}>
              {n === 0 ? d.browse.any : `${n}+`}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">{d.browse.rating}</h3>
        <div className="flex gap-2">
          {RATING_STEPS.map((n) => (
            <Chip key={n} active={filters.minRating === n} onClick={() => set("minRating", n)}>
              {n === 0 ? d.browse.any : d.browse.ratingPlus(String(n))}
            </Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-5">
        <Toggle
          checked={filters.fullyVerifiedOnly}
          onChange={(v) => set("fullyVerifiedOnly", v)}
          label={d.browse.visited}
          hint={d.browse.visitedHint}
        />
        <Toggle
          checked={filters.billsIncluded}
          onChange={(v) => set("billsIncluded", v)}
          label={d.browse.bills}
          hint={d.browse.billsHint}
        />
        <Toggle checked={filters.furnishedOnly} onChange={(v) => set("furnishedOnly", v)} label={d.browse.furnished} />
        <Toggle checked={filters.petsOnly} onChange={(v) => set("petsOnly", v)} label={d.browse.pets} />
        <Toggle checked={filters.stepFreeOnly} onChange={(v) => set("stepFreeOnly", v)} label={d.browse.stepFree} hint={d.browse.stepFreeHint} />
        <Toggle checked={filters.quietOnly} onChange={(v) => set("quietOnly", v)} label={d.browse.quiet} hint={d.browse.quietHint} />
      </section>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-6">
      {/* Search summary bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 lg:flex-row lg:items-center">
        <div className="grid flex-1 grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:flex lg:items-center lg:gap-0">
          <label className="flex min-w-0 flex-col gap-0.5 px-3 lg:min-w-44">
            <span className="text-xs font-semibold">{d.browse.city}</span>
            <select
              value={filters.city}
              onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value, district: "" }))}
              className="bg-transparent text-sm outline-none"
            >
              {[ANYWHERE, ...cities].map((c) => (
                <option key={c} value={c}>
                  {c === ANYWHERE ? d.common.anywhere : t(c)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-0.5 px-3 sm:border-l sm:border-border lg:min-w-40">
            <span className="flex items-center gap-1 text-xs font-semibold">
              <CalendarDays className="size-3" /> {d.search.moveIn}
            </span>
            <input
              type="date"
              value={filters.moveIn}
              onChange={(e) => set("moveIn", e.target.value)}
              className="bg-transparent text-sm outline-none"
            />
          </label>
          <div className="flex flex-col gap-1 px-3 sm:border-l sm:border-border">
            <span className="text-xs font-semibold">{d.browse.stayLength}</span>
            <StayLengthPicker value={filters.stay} onChange={(v) => set("stay", v)} compact />
          </div>
        </div>
        <Button
          variant="outline"
          className="h-11 gap-2 px-4 lg:hidden"
          onClick={() => setShowFilters(true)}
          aria-haspopup="dialog"
        >
          <SlidersHorizontal className="size-4" />
          {d.browse.filters}{activeCount > 0 && ` (${activeCount})`}
        </Button>
      </div>

      {districts.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Chip active={!filters.district} onClick={() => set("district", "")}>
            {d.browse.allOf(t(filters.city))}
          </Chip>
          {districts.map((dist) => (
            <Chip key={dist} active={filters.district === dist} onClick={() => set("district", filters.district === dist ? "" : dist)}>
              {t(dist)}
            </Chip>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Phones and tablets: filters live in a bottom sheet so results stay in view. */}
        <Dialog
          open={showFilters}
          onOpenChange={setShowFilters}
          title={d.browse.filters}
          closeLabel={d.browse.closeFilters}
          className="lg:hidden"
        >
          {panel}
          <div className="sticky -bottom-5 -mx-5 mt-6 -mb-5 flex items-center gap-3 border-t border-border bg-popover px-5 py-4">
            <Button variant="ghost" className="h-12 px-4" onClick={reset} disabled={activeCount === 0}>
              {d.common.reset}
            </Button>
            <Button
              className="h-12 flex-1 bg-dark-forest text-base text-background hover:bg-dark-forest/90"
              onClick={() => setShowFilters(false)}
            >
              {d.browse.showResults(results.length)}
            </Button>
          </div>
        </Dialog>

        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-24">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold">{d.browse.filters}</h2>
              {activeCount > 0 && (
                <button type="button" onClick={reset} className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
                  {d.common.reset}
                </button>
              )}
            </div>
            {panel}
          </div>
        </aside>

        <div>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-dark-forest">
                {d.browse.results(results.length, filters.city !== ANYWHERE ? t(filters.district || filters.city) : null)}
              </h1>
              <p className="text-sm text-muted-foreground">
                {d.browse.pricesFor(d.stay.format(filters.stay), filters.moveIn ? date(filters.moveIn, "MMM d, yyyy") : null)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label={d.map.viewToggle} className="flex rounded-lg border border-input bg-card p-0.5">
              {(
                [
                  ["list", List, d.map.list],
                  ["map", MapIcon, d.map.map],
                ] as const
              ).map(([v, Icon, label]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
                    view === v ? "bg-dark-forest text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{d.browse.sort}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-lg border border-input bg-card px-2.5 py-1.5 text-sm outline-none"
              >
                {(Object.keys(d.browse.sortOptions) as Sort[]).map((key) => (
                  <option key={key} value={key}>
                    {d.browse.sortOptions[key]}
                  </option>
                ))}
              </select>
            </label>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-20 text-center">
              <p className="font-medium">{d.browse.emptyTitle}</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {d.browse.emptyBody}
              </p>
              <Button variant="outline" className="mt-2 h-9 gap-1.5 px-3.5" onClick={reset}>
                <X className="size-4" />
                {d.browse.clearFilters}
              </Button>
            </div>
          ) : view === "map" ? (
            <ResultsMap listings={results} priceOf={total} className="h-[65dvh] min-h-[420px]" />
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((l, i) => (
                // Up to three cards share the first row (xl), so those load eagerly.
                <ListingCard key={l.id} listing={l} stay={filters.stay} eager={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
