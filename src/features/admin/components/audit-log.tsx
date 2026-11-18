"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Download, Search, ShieldAlert, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { auditActions, auditCategories, useAudit, type AuditCategory, type AuditEntry } from "@/features/admin/audit";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

/** Opening this many private documents within one hour looks unusual and is flagged at the top. */
const DOC_ALERT_COUNT = 5;
const DOC_ALERT_WINDOW_MS = 60 * 60 * 1000;

/** The busiest one-hour stretch of document opening by one person, if it reaches the threshold. */
function unusualDocAccess(entries: AuditEntry[]) {
  const byActor = new Map<string, number[]>();
  for (const e of entries) {
    if (e.action !== "doc.viewed") continue;
    byActor.set(e.actor, [...(byActor.get(e.actor) ?? []), parseISO(e.at).getTime()]);
  }
  let worst: { actor: string; count: number } | null = null;
  for (const [actor, times] of byActor) {
    times.sort((a, b) => a - b);
    let start = 0;
    for (let end = 0; end < times.length; end++) {
      while (times[end] - times[start] > DOC_ALERT_WINDOW_MS) start++;
      const count = end - start + 1;
      if (count >= DOC_ALERT_COUNT && (!worst || count > worst.count)) worst = { actor, count };
    }
  }
  return worst;
}

/** Spreadsheets run text that starts with these as a formula; a leading quote stops that. */
function csvCell(value: string | undefined) {
  const text = value ?? "";
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function AuditLog() {
  const { d, date, relative } = useI18n();
  const a = d.admin.audit;
  const { entries } = useAudit();
  const [category, setCategory] = useState<AuditCategory | "all">("all");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [ref, setRef] = useState("");
  const alert = unusualDocAccess(entries);

  const needle = q.trim().toLowerCase();
  const inCategory = (e: AuditEntry) => category === "all" || auditActions[e.action] === category;
  const matches = (e: AuditEntry) =>
    !needle ||
    [e.actor, e.target, e.ref, e.detail, a.actions[e.action]].some((field) => field?.toLowerCase().includes(needle));
  const inRange = (e: AuditEntry) => {
    const day = format(parseISO(e.at), "yyyy-MM-dd");
    return (!from || day >= from) && (!to || day <= to);
  };
  const shown = entries.filter((e) => inCategory(e) && matches(e) && inRange(e) && (!ref || e.ref === ref));
  const countIn = (c: AuditCategory | "all") => entries.filter((e) => c === "all" || auditActions[e.action] === c).length;

  function exportCsv() {
    const header = [a.columns.when, a.columns.staff, a.columns.action, a.columns.target, "ID", "Note"];
    const rows = shown.map((e) => [e.at, e.actor, a.actions[e.action], e.target, e.ref, e.detail]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `nest-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      {alert && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
          <ShieldAlert className="size-5 shrink-0 text-warning" aria-hidden />
          <p className="min-w-0 flex-1 font-medium">{a.alert(alert.actor, alert.count)}</p>
          <Button
            variant="outline"
            className="h-9 px-3"
            onClick={() => {
              setCategory("documents");
              setQ(alert.actor);
            }}
          >
            {a.alertAction}
          </Button>
        </div>
      )}

      <div role="tablist" className="flex gap-2 overflow-x-auto scrollbar-none">
        {(["all", ...auditCategories] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === c ? "border-dark-forest bg-dark-forest text-background" : "border-border bg-card hover:border-foreground/30"
            )}
          >
            {a.categories[c]}
            <span className={cn("text-xs tabular", category === c ? "opacity-80" : "text-muted-foreground")}>{countIn(c)}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={a.search}
            aria-label={a.search}
            className="h-10 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {a.dateFrom}
          <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="h-10 rounded-xl border border-input bg-card px-2 text-sm text-foreground" />
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          {a.dateTo}
          <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="h-10 rounded-xl border border-input bg-card px-2 text-sm text-foreground" />
        </label>
        <Button variant="outline" className="h-10 gap-1.5 px-4" onClick={exportCsv} disabled={shown.length === 0}>
          <Download className="size-4" />
          {a.export}
        </Button>
      </div>

      {(from || to) && (
        <button type="button" onClick={() => { setFrom(""); setTo(""); }} className="w-fit text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
          {a.clear} {a.dateFrom}/{a.dateTo}
        </button>
      )}
      {ref && (
        <p className="flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
          {a.history(ref)}
          <button type="button" aria-label={a.clear} onClick={() => setRef("")} className="rounded-full p-0.5 hover:bg-background/60">
            <X className="size-3.5" />
          </button>
        </p>
      )}

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">{a.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">{a.columns.when}</th>
                <th className="px-4 py-3 font-medium">{a.columns.staff}</th>
                <th className="px-4 py-3 font-medium">{a.columns.action}</th>
                <th className="px-4 py-3 font-medium">{a.columns.target}</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((e) => (
                <tr key={e.id} className="border-b border-border align-top last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="tabular">{date(e.at, "MMM d, HH:mm")}</p>
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {relative(e.at)}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{e.actor}</td>
                  <td className="px-4 py-3">
                    <p className={cn("font-medium", e.action === "doc.viewed" && "text-warning")}>{a.actions[e.action]}</p>
                    {e.detail && (
                      <p className="mt-0.5 text-xs text-muted-foreground" lang="en">
                        {e.detail}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p lang="en">{e.target}</p>
                    {e.ref && (
                      <button
                        type="button"
                        onClick={() => {
                          setRef(e.ref!);
                          setCategory("all");
                          setQ("");
                        }}
                        className="text-xs text-muted-foreground tabular underline-offset-4 hover:text-foreground hover:underline"
                      >
                        #{e.ref}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-sm text-muted-foreground tabular">{a.count(shown.length, entries.length)}</p>
    </div>
  );
}
