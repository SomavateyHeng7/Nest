"use client";

import Image from "next/image";
import Link from "next/link";
import { isAfter, parseISO } from "date-fns";
import { Bath, BedDouble, Check, Plus, Ruler, Star } from "lucide-react";

import { useCompare } from "@/components/compare/compare-provider";
import { VerifiedBadge } from "@/components/listing/verified-badge";
import { isFullyVerified } from "@/data/listings";
import { useI18n } from "@/i18n/client";
import { formatUSD, quoteStay, stayToNights, type StayLength } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types/listing";

export function ListingCard({
  listing,
  showCompare = true,
  stay,
}: {
  listing: Listing;
  showCompare?: boolean;
  /** When set, the card shows the total rent for this stay instead of list prices. */
  stay?: StayLength;
}) {
  const { d, t, date, lt } = useI18n();
  const { has, toggle, isFull } = useCompare();
  const selected = has(listing.id);
  const quote = stay ? quoteStay(listing.pricing, stayToNights(stay)) : null;

  const availableFrom = parseISO(listing.availableFrom);
  const availability = isAfter(availableFrom, new Date())
    ? d.card.availableOn(date(availableFrom, "MMM d"))
    : d.card.availableNow;

  return (
    <article className="group relative flex flex-col gap-3">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted">
        <Image
          src={listing.images[0]}
          alt={lt(listing).text}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <VerifiedBadge full={isFullyVerified(listing)} />
          {showCompare && (
            <button
              type="button"
              onClick={() => toggle(listing.id)}
              disabled={!selected && isFull}
              aria-pressed={selected}
              className={cn(
                "relative z-10 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm transition-colors disabled:opacity-60",
                selected ? "bg-dark-forest text-background" : "bg-background/95 text-foreground hover:bg-background"
              )}
            >
              {selected ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
              {selected ? d.card.comparing : d.card.compare}
            </button>
          )}
        </div>
        <span
          className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm"
          suppressHydrationWarning
        >
          {availability}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="font-medium tracking-wide uppercase">
            {d.propertyType[listing.type]} · {t(listing.district)}, {t(listing.city)}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-foreground">
            <Star className="size-3.5 fill-current text-accent-terracotta" />
            <span className="tabular">{listing.rating.toFixed(2)}</span>
          </span>
        </div>
        <h3 className="line-clamp-1 font-medium text-foreground" lang={lt(listing).lang}>
          <Link
            href={`/listing/${listing.id}`}
            className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:underline"
          >
            {lt(listing).text}
          </Link>
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BedDouble className="size-3.5" />
            {listing.bedrooms === 0 ? d.card.studio : d.card.bed(listing.bedrooms)}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="size-3.5" />
            {d.card.bath(listing.baths)}
          </span>
          <span className="flex items-center gap-1">
            <Ruler className="size-3.5" />
            {listing.sizeSqm} m²
          </span>
        </div>
        {quote && stay ? (
          <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 text-sm">
            <span className="text-base font-semibold text-foreground tabular">{formatUSD(quote.rentTotal)}</span>
            <span className="text-muted-foreground">{d.card.totalFor(d.stay.format(stay))}</span>
            <span className="text-muted-foreground">· {d.rate[quote.tier](formatUSD(quote.rate))}</span>
          </p>
        ) : (
          <p className="mt-1 flex items-baseline gap-1.5 text-sm">
            <span className="text-base font-semibold text-foreground tabular">{formatUSD(listing.pricing.monthly)}</span>
            <span className="text-muted-foreground">{d.common.perMonth}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground tabular">
              {formatUSD(listing.pricing.nightly)} {d.common.perNight}
            </span>
          </p>
        )}
      </div>
    </article>
  );
}
