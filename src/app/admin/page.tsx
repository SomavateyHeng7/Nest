import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Flag, Inbox, TrendingUp } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { BarList } from "@/components/admin/bar-list";
import { StatTile } from "@/components/ui/stat-tile";
import { adminBookings, funnel, platformKpis, reports, stayMix, verificationQueue } from "@/data/admin";
import { getI18n } from "@/i18n/server";
import { formatUSD } from "@/lib/pricing";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.admin.overview.title };
}

export default async function AdminOverview() {
  const { d, date } = await getI18n();
  const o = d.admin.overview;
  const k = platformKpis;

  const change = (k.feeRevenue - k.feeRevenuePrev) / k.feeRevenuePrev;
  const pendingRequests = adminBookings.filter((b) => b.status === "pending").length;
  const highReports = reports.filter((r) => r.severity === "high").length;

  const attention = [
    { href: "/admin/verifications", icon: BadgeCheck, text: o.attentionVerifications(verificationQueue.length) },
    { href: "/admin/reports", icon: Flag, text: o.attentionReports(reports.length, highReports), urgent: highReports > 0 },
    { href: "/admin/bookings", icon: Inbox, text: o.attentionRequests(pendingRequests) },
  ];

  const funnelData = funnel.map((step, i) => ({
    key: step.key,
    label: o.steps[step.key],
    value: step.value,
    note: i === 0 ? undefined : o.ofPrev(`${((step.value / funnel[i - 1].value) * 100).toFixed(step.value / funnel[i - 1].value < 0.1 ? 1 : 0)}%`),
  }));
  const mixData = stayMix.map((b) => ({ key: b.key, label: o.mix[b.key], value: b.value }));

  return (
    <>
      <AdminHeader title={o.title} sub={o.sub(date(new Date(), "EEEE, MMMM d, yyyy"))} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile
          label={o.revenue}
          value={formatUSD(k.feeRevenue)}
          icon={<TrendingUp className="size-4.5" />}
          hint={o.revenueHint(`${change >= 0 ? "+" : ""}${Math.round(change * 100)}%`)}
        />
        <StatTile label={o.booked} value={formatUSD(k.bookedRent)} hint={o.bookedHint} />
        <StatTile label={o.live} value={String(k.liveListings)} hint={o.liveHint(verificationQueue.length)} />
        <StatTile label={o.reply} value={o.hours(k.medianReplyHours)} hint={o.replyHint} />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 font-semibold">{o.attention}</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {attention.map(({ href, icon: Icon, text, urgent }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
              >
                <span
                  className={
                    urgent
                      ? "grid size-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive"
                      : "grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"
                  }
                >
                  <Icon className="size-4.5" />
                </span>
                <span className="flex-1 text-sm font-medium">{text}</span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <BarList
          title={o.funnel}
          sub={o.funnelSub}
          data={funnelData}
          stepLabel={o.colStep}
          valueLabel={o.colCount}
          shareLabel={o.colShare}
        />
        <BarList
          title={o.stayMix}
          sub={o.stayMixSub}
          data={mixData}
          stepLabel={o.colStep}
          valueLabel={o.colCount}
          shareLabel={o.colShare}
        />
      </div>
    </>
  );
}
