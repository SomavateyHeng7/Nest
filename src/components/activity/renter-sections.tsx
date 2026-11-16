"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Video } from "lucide-react";

import { useActivity } from "@/components/activity/activity-provider";
import { ListingCard } from "@/components/listing/listing-card";
import { Button } from "@/components/ui/button";
import { renterViewings } from "@/data/dashboard";
import { getListingById } from "@/data/listings";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** Viewings: the demo's fixed ones plus any requested in this browser. */
export function RenterViewings() {
  const { d, t, date, lt } = useI18n();
  const v = d.viewing;
  const { viewings, cancelViewing, ready } = useActivity();
  const all = [...renterViewings, ...(ready ? viewings : [])].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );
  const mine = new Set(viewings.map((x) => x.id));

  if (all.length === 0) return null;

  return (
    <section id="viewings" className="mt-10 scroll-mt-20">
      <h2 className="font-semibold">{v.myTitle}</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {all.map((item) => {
          const listing = getListingById(item.listingId);
          if (!listing) return null;
          const Icon = item.type === "video" ? Video : MapPin;
          return (
            <li key={item.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3">
              <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-accent py-1.5 text-accent-foreground">
                <span className="text-[11px] font-medium">{date(item.date, "MMM")}</span>
                <span className="text-xl leading-tight font-semibold tabular">{date(item.date, "d")}</span>
                <span className="text-[11px] tabular">{item.time}</span>
              </div>
              <div className="relative hidden size-14 shrink-0 overflow-hidden rounded-xl sm:block">
                <Image src={listing.images[0]} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/listing/${listing.id}`} lang={lt(listing).lang} className="block truncate font-semibold hover:underline">
                  {lt(listing).text}
                </Link>
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Icon className="size-3.5" />
                  {v.types[item.type].label} · {t(listing.district)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span
                  className={cn(
                    "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap",
                    item.status === "confirmed" ? "bg-accent text-accent-foreground" : "bg-warning/15 text-warning"
                  )}
                >
                  {v.status[item.status]}
                </span>
                {mine.has(item.id) && (
                  <button
                    type="button"
                    onClick={() => cancelViewing(item.id)}
                    className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
                  >
                    {v.cancel}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function SavedHomes() {
  const { d } = useI18n();
  const { saved, ready } = useActivity();
  const listings = saved.map(getListingById).filter((l) => l !== undefined);

  return (
    <section id="saved" className="mt-10 scroll-mt-20">
      <h2 className="flex items-center gap-2 font-semibold">
        <Heart className="size-4 fill-accent-terracotta text-accent-terracotta" />
        {d.saved.title}
        {ready && listings.length > 0 && <span className="text-sm font-normal text-muted-foreground tabular">({listings.length})</span>}
      </h2>
      {!ready ? (
        <div className="mt-3 h-24 animate-pulse rounded-2xl bg-muted/60" />
      ) : listings.length === 0 ? (
        <div className="mt-3 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{d.saved.empty}</p>
          <Button variant="outline" className="h-9 px-3.5" nativeButton={false} render={<Link href="/listing" />}>
            {d.saved.browse}
          </Button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </section>
  );
}
