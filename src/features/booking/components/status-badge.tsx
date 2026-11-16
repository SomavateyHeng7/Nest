"use client";

import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";
import type { BookingStatus, StayStatus } from "@/features/booking/types";

type Status = StayStatus | BookingStatus | "live" | "paused" | "in-review";

const styles: Record<Status, { className: string }> = {
  requested: { className: "bg-warning/15 text-warning" },
  pending: { className: "bg-accent-terracotta/15 text-terracotta-strong" },
  confirmed: { className: "bg-accent text-accent-foreground" },
  active: { className: "bg-primary-sage text-white" },
  completed: { className: "bg-muted text-muted-foreground" },
  cancelled: { className: "bg-destructive/10 text-destructive" },
  declined: { className: "bg-destructive/10 text-destructive" },
  live: { className: "bg-success/15 text-success" },
  paused: { className: "bg-muted text-muted-foreground" },
  "in-review": { className: "bg-warning/15 text-warning" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { d } = useI18n();
  const s = styles[status];
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap", s.className, className)}>
      {d.status[status]}
    </span>
  );
}
