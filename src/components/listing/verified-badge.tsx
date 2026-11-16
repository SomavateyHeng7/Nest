"use client";

import { BadgeCheck, ShieldCheck } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function VerifiedBadge({
  full = true,
  className,
  tone = "solid",
}: {
  full?: boolean;
  className?: string;
  tone?: "solid" | "soft";
}) {
  const { d } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        tone === "solid" ? "bg-background/95 text-dark-forest shadow-sm" : "bg-accent text-accent-foreground",
        className
      )}
    >
      {full ? <BadgeCheck className="size-3.5 text-primary-sage" /> : <ShieldCheck className="size-3.5 text-primary-sage" />}
      {full ? d.verified.full : d.verified.partial}
    </span>
  );
}
