"use client";

import { useState } from "react";
import { Check, Clock, MapPin, Video } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { viewingTimes } from "@/features/viewings/data";
import { getListingById } from "@/features/listings/data";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";
import type { OwnerViewing } from "@/features/viewings/types";

type Outcome = { kind: "confirmed" } | { kind: "suggested"; time: string };

export function OwnerViewings({ viewings }: { viewings: OwnerViewing[] }) {
  const { d, t, date, lt } = useI18n();
  const v = d.viewing;
  const [outcomes, setOutcomes] = useState<Record<string, Outcome>>({});
  const [suggesting, setSuggesting] = useState<{ id: string; time: string | null } | null>(null);

  if (viewings.length === 0) return null;

  return (
    <section className="mt-10 min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 className="font-semibold">{v.ownerTitle}</h2>
        <span className="text-sm text-muted-foreground">{v.ownerNote}</span>
      </div>
      <ul className="flex flex-col gap-3">
        {viewings.map((item) => {
          const listing = getListingById(item.listingId);
          if (!listing) return null;
          const outcome = outcomes[item.id];
          const Icon = item.type === "video" ? Video : MapPin;
          const when = v.at(date(item.date, "EEE, MMM d"), item.time);
          const isSuggesting = suggesting?.id === item.id;

          return (
            <li key={item.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start gap-3">
                <Avatar size="lg">
                  <AvatarImage src={item.renterAvatarUrl} alt={item.renterName} />
                  <AvatarFallback>{item.renterName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.renterName}</p>
                  <p className="truncate text-sm text-muted-foreground" lang={lt(listing).lang}>
                    {lt(listing).text}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="size-3.5 text-primary-sage" />
                      {when}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon className="size-3.5" />
                      {v.types[item.type].label} · {t(listing.district)}
                    </span>
                  </p>
                </div>
                {outcome && (
                  <span
                    className={cn(
                      "inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-semibold",
                      outcome.kind === "confirmed" ? "bg-accent text-accent-foreground" : "bg-warning/15 text-warning"
                    )}
                  >
                    {outcome.kind === "confirmed" ? (
                      <>
                        <Check className="size-3.5" />
                        {v.status.confirmed}
                      </>
                    ) : (
                      v.suggested(v.at(date(item.date, "EEE, MMM d"), outcome.time))
                    )}
                  </span>
                )}
              </div>

              {item.note && !outcome && <p className="mt-3 rounded-xl bg-muted/70 px-4 py-3 text-sm">“{item.note}”</p>}

              {!outcome && !isSuggesting && (
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button variant="outline" className="h-9 px-3" onClick={() => setSuggesting({ id: item.id, time: null })}>
                    {v.suggest}
                  </Button>
                  <Button
                    className="h-9 gap-1.5 bg-accent-terracotta px-3.5 text-white hover:bg-terracotta-strong"
                    onClick={() => setOutcomes((o) => ({ ...o, [item.id]: { kind: "confirmed" } }))}
                  >
                    <Check className="size-4" />
                    {v.confirm}
                  </Button>
                </div>
              )}

              {isSuggesting && (
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border p-3">
                  <p className="text-sm font-medium">{date(item.date, "EEE, MMM d")}</p>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={v.time}>
                    {viewingTimes
                      .filter((slot) => slot !== item.time)
                      .map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          role="radio"
                          aria-checked={suggesting.time === slot}
                          onClick={() => setSuggesting({ id: item.id, time: slot })}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-sm font-medium tabular",
                            suggesting.time === slot ? "border-dark-forest bg-accent ring-1 ring-dark-forest" : "border-border hover:border-foreground/30"
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" className="h-9 px-3" onClick={() => setSuggesting(null)}>
                      {d.checkout.cancel}
                    </Button>
                    <Button
                      className="h-9 px-4"
                      disabled={!suggesting.time}
                      onClick={() => {
                        if (!suggesting.time) return;
                        setOutcomes((o) => ({ ...o, [item.id]: { kind: "suggested", time: suggesting.time! } }));
                        setSuggesting(null);
                      }}
                    >
                      {v.send}
                    </Button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
