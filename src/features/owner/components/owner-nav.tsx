"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, Plus, Wallet } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

const tabs = [
  { href: "/host", key: "overview", icon: LayoutDashboard },
  { href: "/host/calendar", key: "calendar", icon: CalendarDays },
  { href: "/earning", key: "income", icon: Wallet },
] as const;

export function OwnerShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { d } = useI18n();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wider text-accent-terracotta uppercase">{d.owner.eyebrow}</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight text-dark-forest">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>

      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-border scrollbar-none" aria-label={d.owner.eyebrow}>
        {tabs.map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              pathname === href
                ? "border-dark-forest text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {d.owner.tabs[key]}
          </Link>
        ))}
        <Link
          href="/host/new"
          className="-mb-px ml-auto flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium whitespace-nowrap text-accent-terracotta hover:text-terracotta-strong"
        >
          <Plus className="size-4" />
          {d.owner.addProperty}
        </Link>
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
