import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { TripsList } from "@/components/dashboard/trips-list";
import { trips } from "@/data/dashboard";

export default function RenterPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Your trips</h1>
      <DashboardTabs />
      <TripsList trips={trips} />
    </div>
  );
}
