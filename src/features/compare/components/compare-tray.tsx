"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, X } from "lucide-react";

import { MAX_COMPARE, useCompare } from "@/features/compare/components/compare-provider";
import { Button } from "@/shared/ui/button";
import { getListingById } from "@/features/listings/data";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

/**
 * Floating compare bar. On phones it collapses to a small pill so it doesn't
 * cover booking controls; tapping the pill expands the full bar. On listing
 * pages it sits above the sticky mobile "Request to book" bar.
 */
export function CompareTray() {
  const { ids, remove, clear } = useCompare();
  const pathname = usePathname();
  const { d, t, lt } = useI18n();
  const [expanded, setExpanded] = useState(false);

  if (ids.length === 0 || pathname === "/compare") return null;

  const items = ids.map(getListingById).filter((l) => l !== undefined);
  const onListingPage = pathname.startsWith("/listing/");

  const cta =
    items.length < 2 ? (
      <span className="shrink-0 px-2 text-xs text-muted-foreground">{d.compare.trayAddMore}</span>
    ) : (
      <Button
        className="h-9 shrink-0 gap-1.5 bg-accent-terracotta px-3.5 text-white hover:bg-terracotta-strong"
        nativeButton={false}
        render={<Link href="/compare" />}
      >
        {d.compare.tray}
        <ArrowRight className="size-4" />
      </Button>
    );

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-50 flex justify-end px-4 sm:justify-center",
        // The listing page's booking bar stays pinned below lg, so the tray sits above it until then.
        onListingPage ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-4" : "bottom-4"
      )}
    >
      {/* Phone: collapsed pill */}
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-expanded={false}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-popover py-1.5 pr-3.5 pl-1.5 text-sm font-semibold shadow-lg shadow-black/15 sm:hidden"
        >
          <span className="flex -space-x-2">
            {items.map((l) => (
              <span key={l.id} className="relative size-7 overflow-hidden rounded-full ring-2 ring-popover">
                <Image src={l.images[0]} alt="" fill sizes="28px" className="object-cover" />
              </span>
            ))}
          </span>
          {d.compare.trayPill(items.length)}
        </button>
      )}

      {/* Full bar: always on sm+, on phones only when expanded */}
      <div
        className={cn(
          "pointer-events-auto w-full max-w-2xl items-center gap-3 rounded-2xl border border-border bg-popover p-2.5 pl-4 shadow-xl shadow-black/10",
          expanded ? "flex" : "hidden sm:flex"
        )}
      >
        <p className="hidden shrink-0 text-sm font-medium sm:block">
          {d.compare.tray} <span className="text-muted-foreground tabular">{items.length}/{MAX_COMPARE}</span>
        </p>
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto scrollbar-none">
          {items.map((l) => (
            <div key={l.id} className="flex shrink-0 items-center gap-2 rounded-lg bg-muted py-1 pr-1 pl-1">
              <div className="relative size-8 overflow-hidden rounded-md">
                <Image src={l.images[0]} alt="" fill sizes="32px" className="object-cover" />
              </div>
              <span className="max-w-28 truncate text-xs font-medium">{t(l.district)}</span>
              <button
                type="button"
                onClick={() => remove(l.id)}
                aria-label={d.compare.trayRemove(lt(l).text)}
                className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={clear} className="hidden text-xs text-muted-foreground hover:text-foreground sm:block">
          {d.common.clear}
        </button>
        {cta}
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label={d.compare.trayHide}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted sm:hidden"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
    </div>
  );
}
