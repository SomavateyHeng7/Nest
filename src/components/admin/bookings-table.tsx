"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { differenceInCalendarDays, differenceInHours, parseISO } from "date-fns";
import { AlarmClock, Search } from "lucide-react";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { adminBookings } from "@/data/admin";
import { getListingById } from "@/data/listings";
import { useI18n } from "@/i18n/client";
import { formatUSD, placementFee } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/dashboard";

const statuses: (BookingStatus | "all")[] = ["all", "pending", "confirmed", "active", "completed", "declined"];

export function BookingsTable() {
  const { d, range, lt } = useI18n();
  const b = d.admin.bookings;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [now] = useState(() => new Date());

  const rows = useMemo(
    () =>
      adminBookings.map((row) => {
        const listing = getListingById(row.listingId)!;
        const nights = differenceInCalendarDays(parseISO(row.moveOut), parseISO(row.moveIn));
        const fee = row.status === "declined" ? 0 : placementFee(row.firstMonthRent, nights, row.rentTotal).fee;
        const overdue = row.status === "pending" && differenceInHours(now, parseISO(row.requestedAt)) > 24;
        return { ...row, listing, nights, fee, overdue };
      }),
    [now]
  );

  const needle = q.trim().toLowerCase();
  const shown = rows.filter(
    (r) =>
      (status === "all" || r.status === status) &&
      (!needle ||
        [r.renterName, r.listing.owner.name, r.listing.title, r.listing.titleKm ?? "", r.id].some((s) => s.toLowerCase().includes(needle)))
  );
  const feeTotal = shown.reduce((s, r) => s + r.fee, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={b.search}
            aria-label={b.search}
            className="h-10 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                status === s ? "border-dark-forest bg-dark-forest text-background" : "border-border bg-card hover:border-foreground/30"
              )}
            >
              {s === "all" ? b.all : d.status[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">{b.cols.id}</th>
              <th className="px-4 py-3 font-medium">{b.cols.listing}</th>
              <th className="px-4 py-3 font-medium">{b.cols.renter}</th>
              <th className="px-4 py-3 font-medium">{b.cols.owner}</th>
              <th className="px-4 py-3 font-medium">{b.cols.dates}</th>
              <th className="px-4 py-3 text-right font-medium">{b.cols.total}</th>
              <th className="px-4 py-3 text-right font-medium">{b.cols.fee}</th>
              <th className="px-4 py-3 font-medium">{b.cols.status}</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                <td className="max-w-56 px-4 py-3">
                  <Link href={`/listing/${r.listing.id}`} lang={lt(r.listing).lang} className="block truncate font-medium hover:underline">
                    {lt(r.listing).text}
                  </Link>
                </td>
                <td className="px-4 py-3">{r.renterName}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.listing.owner.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {range(r.moveIn, r.moveOut)}
                  <span className="block text-xs">{d.common.nights(r.nights)}</span>
                </td>
                <td className="px-4 py-3 text-right tabular">{formatUSD(r.rentTotal)}</td>
                <td className="px-4 py-3 text-right font-medium tabular">{r.fee ? formatUSD(r.fee) : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge status={r.status} />
                    {r.overdue && (
                      <span className="flex items-center gap-1 text-xs font-medium text-destructive" suppressHydrationWarning>
                        <AlarmClock className="size-3.5" />
                        {b.overdue}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">{b.empty}</p>}
      </div>
      <p className="text-sm text-muted-foreground tabular">{b.totals(shown.length, formatUSD(feeTotal))}</p>
    </div>
  );
}
