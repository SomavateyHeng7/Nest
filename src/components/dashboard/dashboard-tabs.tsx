"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/profile", label: "Profile" },
  { href: "/renter", label: "Your trips" },
  { href: "/host", label: "Hosting" },
  { href: "/earning", label: "Earnings" },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-4">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            pathname === tab.href
              ? "border-primary-sage bg-primary-sage text-white"
              : "border-border bg-transparent text-foreground hover:bg-muted"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
