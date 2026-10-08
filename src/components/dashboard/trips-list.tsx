"use client";

import { useMemo, useState } from "react";

import { TripCard } from "@/components/dashboard/trip-card";
import { cn } from "@/lib/utils";
import type { Trip, TripStatus } from "@/types/dashboard";

const tabs: { value: TripStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function TripsList({ trips }: { trips: Trip[] }) {
  const [status, setStatus] = useState<TripStatus | "all">("all");

  const filtered = useMemo(
    () => (status === "all" ? trips : trips.filter((t) => t.status === status)),
    [trips, status]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              status === tab.value
                ? "border-primary-sage bg-primary-sage text-white"
                : "border-border bg-transparent text-foreground hover:bg-muted"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">No trips here yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
