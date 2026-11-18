"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgeCheck, CalendarRange, Flag, LayoutDashboard, MessageSquareQuote, Scale, ScrollText, UserPlus, Users } from "lucide-react";

import { hostApplications, reports, verificationQueue } from "@/features/admin/data";
import { useDisputes } from "@/features/disputes/store";
import { useReviews } from "@/features/reviews/store";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

const items = [
  { href: "/admin", key: "overview", icon: LayoutDashboard },
  { href: "/admin/applications", key: "applications", icon: UserPlus, count: hostApplications.filter((a) => a.status === "pending").length },
  { href: "/admin/verifications", key: "verifications", icon: BadgeCheck, count: verificationQueue.length },
  { href: "/admin/bookings", key: "bookings", icon: CalendarRange },
  { href: "/admin/users", key: "users", icon: Users },
  { href: "/admin/reports", key: "reports", icon: Flag, count: reports.length },
  { href: "/admin/disputes", key: "disputes", icon: Scale },
  { href: "/admin/reviews", key: "reviews", icon: MessageSquareQuote },
  { href: "/admin/audit", key: "audit", icon: ScrollText },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const { d } = useI18n();
  const reviews = useReviews();
  const disputeStore = useDisputes();
  // Counts that change while staff work, so they come from live data rather than the static list.
  const live: Partial<Record<(typeof items)[number]["key"], number>> = {
    disputes: disputeStore.items.filter((c) => c.status !== "resolved").length,
    reviews: reviews.withStatus("pending").length + new Set(reviews.openReports.map((r) => r.reviewId)).size,
  };

  return (
    <nav aria-label={d.admin.eyebrow} className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col">
      {items.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;
        const count = live[item.key] ?? ("count" in item ? item.count : 0);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            <span className="flex-1">{d.admin.nav[item.key]}</span>
            {count > 0 && (
              <span className="rounded-full bg-accent-terracotta/15 px-1.5 text-xs font-semibold text-terracotta-strong tabular">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
