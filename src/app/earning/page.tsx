import type { Metadata } from "next";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Info } from "lucide-react";

import { EarningsChart } from "@/features/owner/components/earnings-chart";
import { OwnerShell } from "@/features/owner/components/owner-nav";
import { StatusBadge } from "@/features/booking/components/status-badge";
import { StatTile } from "@/shared/ui/stat-tile";
import { currentUser } from "@/features/account/current-user";
import { monthlyIncome } from "@/features/owner/data";
import { ownerBookings } from "@/features/booking/data";
import { getListingById } from "@/features/listings/data";
import { getI18n } from "@/i18n/server";
import { formatUSD, placementFee, placementFeeTiers } from "@/features/stays/lib/pricing";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.income.title };
}

export default async function EarningPage() {
  const { d, range, lt } = await getI18n();
  const i = d.income;

  const rent = monthlyIncome.reduce((s, m) => s + m.rent, 0);
  const fees = monthlyIncome.reduce((s, m) => s + m.fees, 0);
  const booked = ownerBookings.filter((b) => b.status !== "declined" && b.status !== "pending");
  const upcomingPayout = ownerBookings
    .filter((b) => b.status === "confirmed")
    .reduce((s, b) => {
      const nights = differenceInCalendarDays(parseISO(b.moveOut), parseISO(b.moveIn));
      return s + b.firstMonthRent - placementFee(b.firstMonthRent, nights, b.rentTotal).fee;
    }, 0);

  return (
    <OwnerShell title={i.title} description={i.sub(currentUser.payoutMethod)}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={i.rentReceived} value={formatUSD(rent)} hint={i.last6} />
        <StatTile label={i.fees} value={formatUSD(fees)} hint={i.feesHint(((fees / rent) * 100).toFixed(0))} />
        <StatTile label={i.payout} value={formatUSD(rent - fees)} hint={i.payoutHint} />
        <StatTile label={i.nextPayout} value={formatUSD(upcomingPayout)} hint={i.nextPayoutHint} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <EarningsChart data={monthlyIncome} />

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-semibold">{i.howTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{i.howBody}</p>
          <ul className="mt-4 flex flex-col gap-2">
            {placementFeeTiers.map((t) => (
              <li key={t.minMonths} className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-3.5 py-2.5 text-sm">
                <span>{i.tierStay(d.fees.tierLabel(t.minMonths, t.maxMonths))}</span>
                <span className="font-semibold tabular">{d.fees.ofOneMonth(t.rate * 100)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            {i.agentNote}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-semibold">{i.table}</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">{i.cols.renter}</th>
                <th className="px-4 py-3 font-medium">{i.cols.property}</th>
                <th className="px-4 py-3 font-medium">{i.cols.stay}</th>
                <th className="px-4 py-3 text-right font-medium">{i.cols.total}</th>
                <th className="px-4 py-3 text-right font-medium">{i.cols.fee}</th>
                <th className="px-4 py-3 text-right font-medium">{i.cols.receive}</th>
                <th className="px-4 py-3 font-medium">{i.cols.status}</th>
              </tr>
            </thead>
            <tbody>
              {booked.map((b) => {
                const listing = getListingById(b.listingId);
                const nights = differenceInCalendarDays(parseISO(b.moveOut), parseISO(b.moveIn));
                const { fee, tier } = placementFee(b.firstMonthRent, nights, b.rentTotal);
                return (
                  <tr key={b.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{b.renterName}</td>
                    <td className="max-w-48 truncate px-4 py-3 text-muted-foreground" lang={listing ? lt(listing).lang : undefined}>
                      {listing ? lt(listing).text : null}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{range(b.moveIn, b.moveOut)}</td>
                    <td className="px-4 py-3 text-right tabular">{formatUSD(b.rentTotal)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-muted-foreground tabular">
                      −{formatUSD(fee)} <span className="text-xs">({tier.rate * 100}%)</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular">{formatUSD(b.rentTotal - fee)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </OwnerShell>
  );
}
