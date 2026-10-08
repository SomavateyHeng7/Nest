import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { EarningsChart } from "@/components/dashboard/earnings-chart";
import { ReservationRow } from "@/components/dashboard/reservation-row";
import { StatTile } from "@/components/ui/stat-tile";
import { getTotalEarned, getUpcomingPayout, monthlyEarnings, reservations } from "@/data/dashboard";

export default function EarningPage() {
  const totalEarned = getTotalEarned();
  const upcomingPayout = getUpcomingPayout();
  const thisMonth = monthlyEarnings[monthlyEarnings.length - 1];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Earnings</h1>
      <DashboardTabs />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Total earned" value={`$${totalEarned}`} hint="Last 6 months" />
        <StatTile label="Upcoming payout" value={`$${upcomingPayout}`} hint="From confirmed reservations" />
        <StatTile label="This month" value={`$${thisMonth?.amount ?? 0}`} hint={thisMonth?.month} />
      </div>

      <EarningsChart data={monthlyEarnings} />

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-foreground">Payout history</h2>
        <div className="flex flex-col gap-3">
          {reservations.map((reservation) => (
            <ReservationRow key={reservation.id} reservation={reservation} />
          ))}
        </div>
      </section>
    </div>
  );
}
