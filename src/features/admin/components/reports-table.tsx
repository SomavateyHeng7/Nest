"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Ban, CircleCheck, MessageSquare, RotateCcw, ShieldAlert } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { reports as initialReports, type Report, type ReportSeverity } from "@/features/admin/data";
import { getListingById } from "@/features/listings/data";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

type Tab = "open" | "resolved";

const severityStyle: Record<ReportSeverity, string> = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/15 text-warning",
  low: "bg-muted text-muted-foreground",
};

export function ReportsTable() {
  const { d, relative, lt } = useI18n();
  const r = d.admin.reports;
  const tt = d.admin.toast;
  const [resolved, setResolved] = useState<string[]>([]);
  const [paused, setPaused] = useState<string[]>([]);
  const [tab, setTab] = useState<Tab>("open");

  const isResolved = (rep: Report) => resolved.includes(rep.id);
  const shown = initialReports.filter((rep) => (tab === "resolved") === isResolved(rep));
  const count = (t: Tab) => initialReports.filter((rep) => (t === "resolved") === isResolved(rep)).length;

  function resolve(rep: Report) {
    setResolved((list) => [...list, rep.id]);
    toast.success(tt.resolved, {
      description: rep.subject,
      action: { label: d.toast.undo, onClick: () => setResolved((list) => list.filter((x) => x !== rep.id)) },
    });
  }

  function reopen(rep: Report) {
    setResolved((list) => list.filter((x) => x !== rep.id));
    toast.info(tt.reopened);
  }

  function pause(rep: Report) {
    setPaused((list) => [...list, rep.id]);
    toast.warning(tt.paused, {
      description: rep.subject,
      action: { label: d.toast.undo, onClick: () => setPaused((list) => list.filter((x) => x !== rep.id)) },
    });
  }

  return (
    <>
      <div role="tablist" className="mb-5 flex gap-2">
        {(["open", "resolved"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t ? "border-dark-forest bg-dark-forest text-background" : "border-border bg-card hover:border-foreground/30"
            )}
          >
            {r.tabs[t]}
            <span className={cn("text-xs tabular", tab === t ? "opacity-80" : "text-muted-foreground")}>{count(t)}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">{r.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((rep) => {
            const listing = rep.listingId ? getListingById(rep.listingId) : undefined;
            const Icon = rep.severity === "high" ? ShieldAlert : AlertTriangle;
            return (
              <li key={rep.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-semibold", severityStyle[rep.severity])}>
                    <Icon className="size-3" />
                    {r.severity[rep.severity]}
                  </span>
                  <p className="font-semibold">{r.kind[rep.kind]}</p>
                  <span className="text-xs text-muted-foreground">#{rep.id}</span>
                  <span className="ml-auto text-xs text-muted-foreground" suppressHydrationWarning>
                    {relative(rep.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {r.about(listing ? lt(listing).text : rep.subject)} · {r.by(rep.reporter)}
                </p>
                <blockquote className="mt-3 border-l-2 border-border pl-3 text-sm" lang="en">
                  {rep.message}
                </blockquote>
                {paused.includes(rep.id) && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-warning">
                    <Ban className="size-3.5" />
                    {tt.paused}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {!isResolved(rep) ? (
                    <>
                      <Button variant="outline" className="h-9 gap-1.5 px-3" onClick={() => toast.success(tt.contacted)}>
                        <MessageSquare className="size-4" />
                        {r.contact}
                      </Button>
                      <Button variant="outline" className="h-9 gap-1.5 px-3" onClick={() => toast.info(tt.warned(rep.subject))}>
                        <AlertTriangle className="size-4" />
                        {r.warn}
                      </Button>
                      {rep.listingId && (
                        <>
                          <Button
                            variant="outline"
                            className="h-9 gap-1.5 px-3"
                            disabled={paused.includes(rep.id)}
                            onClick={() => pause(rep)}
                          >
                            <Ban className="size-4" />
                            {r.pause}
                          </Button>
                          <Button variant="ghost" className="h-9 px-3" nativeButton={false} render={<Link href={`/listing/${rep.listingId}`} />}>
                            {listing ? lt(listing).text : rep.listingId}
                          </Button>
                        </>
                      )}
                      <Button className="ml-auto h-9 gap-1.5 px-3" onClick={() => resolve(rep)}>
                        <CircleCheck className="size-4" />
                        {r.resolve}
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" className="h-9 gap-1.5 px-3" onClick={() => reopen(rep)}>
                      <RotateCcw className="size-4" />
                      {r.reopen}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
