"use client";

import { useState } from "react";
import { AlertTriangle, BadgeCheck, Check, CircleDashed, FileText, Mail, MapPin, Phone, ScanFace, Search, Wallet } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { toast } from "@/shared/ui/toast";
import { canApproveHost, hostApplications, type ApplicationStatus, type DocState, type HostApplication } from "@/features/admin/data";
import { useAudit } from "@/features/admin/audit";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

const tabs: ApplicationStatus[] = ["pending", "info", "approved", "rejected"];

function Pill({ tone, children }: { tone: "ok" | "warn" | "bad" | "muted"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-full px-2 text-xs font-semibold",
        tone === "ok" && "bg-success/15 text-success",
        tone === "warn" && "bg-warning/15 text-warning",
        tone === "bad" && "bg-destructive/10 text-destructive",
        tone === "muted" && "bg-muted text-muted-foreground"
      )}
    >
      {tone === "ok" ? <Check className="size-3" /> : <CircleDashed className="size-3" />}
      {children}
    </span>
  );
}

const docTone = (s: DocState) => (s === "approved" ? "ok" : s === "received" ? "warn" : "bad");

export function HostApplications() {
  const { d, date, relative } = useI18n();
  const a = d.admin.applications;
  const docState = d.admin.verify.docState;
  const tt = d.admin.toast;

  const { log } = useAudit();
  const [apps, setApps] = useState(hostApplications);
  const [tab, setTab] = useState<ApplicationStatus>("pending");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reason, setReason] = useState(0);

  const open = apps.find((x) => x.id === openId);
  const patch = (id: string, changes: Partial<HostApplication>) =>
    setApps((list) => list.map((x) => (x.id === id ? { ...x, ...changes } : x)));

  const needle = q.trim().toLowerCase();
  const shown = apps
    .filter((x) => x.status === tab)
    .filter(
      (x) =>
        !needle ||
        x.name.toLowerCase().includes(needle) ||
        x.phone.replace(/\s/g, "").includes(needle.replace(/\s/g, "")) ||
        x.email?.toLowerCase().includes(needle)
    );

  function setCheck(app: HostApplication, key: "identity" | "selfie" | "payout", state: DocState) {
    patch(app.id, { checks: { ...app.checks, [key]: state } });
    log({ action: state === "approved" ? "host.checkApproved" : "host.checkRequested", target: app.name, ref: app.id, detail: a.checks[key] });
    if (state === "approved") toast.success(tt.docApproved, { description: `${app.name} · ${a.checks[key]}` });
    else toast.info(tt.docRequested(app.name.split(" ")[0]));
  }

  function decide(app: HostApplication, status: ApplicationStatus, message?: string) {
    const prev = { status: app.status, decisionReason: app.decisionReason, decidedAt: app.decidedAt };
    patch(app.id, { status, decisionReason: message, decidedAt: new Date().toISOString() });
    setOpenId(null);
    log({
      action: status === "approved" ? "host.approved" : status === "rejected" ? "host.rejected" : "host.infoRequested",
      target: app.name,
      ref: app.id,
      detail: message,
    });
    const first = app.name.split(" ")[0];
    const text = status === "approved" ? tt.hostApproved(app.name) : status === "rejected" ? tt.hostRejected(app.name) : tt.hostInfo(first);
    const show = status === "rejected" ? toast.warning : toast.success;
    show(text, {
      description: message,
      action: {
        label: d.toast.undo,
        onClick: () => {
          patch(app.id, prev);
          log({ action: "host.reopened", target: app.name, ref: app.id });
        },
      },
    });
  }

  function reopen(app: HostApplication) {
    patch(app.id, { status: "pending", decisionReason: undefined, decidedAt: undefined });
    log({ action: "host.reopened", target: app.name, ref: app.id });
    toast.info(tt.hostReopened(app.name));
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" className="flex gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={tab === s}
              onClick={() => setTab(s)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                tab === s ? "border-dark-forest bg-dark-forest text-background" : "border-border bg-card hover:border-foreground/30"
              )}
            >
              {a.tabs[s]}
              <span className={cn("text-xs tabular", tab === s ? "opacity-80" : "text-muted-foreground")}>
                {apps.filter((x) => x.status === s).length}
              </span>
            </button>
          ))}
        </div>
        <label className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={a.search}
            aria-label={a.search}
            className="h-10 w-full rounded-xl border border-input bg-card pr-3 pl-9 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">{a.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((app) => (
            <li key={app.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
              <Avatar className="size-12">
                <AvatarImage src={app.avatarUrl} alt="" />
                <AvatarFallback>{app.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{app.name}</p>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">{a.type[app.type]}</span>
                  {app.flags.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
                      <AlertTriangle className="size-3.5" />
                      {app.flags.length}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {app.phone} · {app.city} · {a.properties(app.properties)}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Pill tone={app.checks.phone ? "ok" : "bad"}>
                    {a.checks.phone}: {app.checks.phone ? a.phoneOk : a.phoneNo}
                  </Pill>
                  <Pill tone={docTone(app.checks.identity)}>
                    {a.checks.identity}: {docState[app.checks.identity]}
                  </Pill>
                  <Pill tone={docTone(app.checks.selfie)}>
                    {a.checks.selfie}: {docState[app.checks.selfie]}
                  </Pill>
                </div>
                {app.decisionReason && app.status !== "pending" && (
                  <p className="mt-2 text-xs text-muted-foreground">{app.decisionReason}</p>
                )}
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                  {app.status === "approved" && app.decidedAt
                    ? a.approvedOn(relative(app.decidedAt))
                    : app.status === "rejected" && app.decidedAt
                      ? a.rejectedOn(relative(app.decidedAt))
                      : app.status === "info" && app.decidedAt
                        ? a.infoSentOn(relative(app.decidedAt))
                        : a.applied(relative(app.appliedAt))}
                </span>
                {app.status === "approved" || app.status === "rejected" ? (
                  <Button variant="outline" className="h-9 px-4" onClick={() => reopen(app)}>
                    {a.reopen}
                  </Button>
                ) : (
                  <Button
                    className="h-9 px-4"
                    variant={app.status === "pending" ? "default" : "outline"}
                    onClick={() => {
                      setReason(0);
                      setOpenId(app.id);
                    }}
                  >
                    {a.review}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={Boolean(open)}
        onOpenChange={(o) => !o && setOpenId(null)}
        title={a.dialogTitle}
        description={open ? `${open.name} · ${a.type[open.type]}` : undefined}
        closeLabel={a.close}
        className="sm:w-[min(40rem,calc(100vw-2rem))]"
      >
        {open && (
          <div className="flex flex-col gap-4">
            <div className="rounded-xl bg-muted/60 p-3 text-sm">
              <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{a.about}</p>
              <p>{open.note ?? <span className="text-muted-foreground">{a.noNote}</span>}</p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <li className="inline-flex items-center gap-1">
                  <Phone className="size-3.5" />
                  {open.phone}
                </li>
                {open.email && (
                  <li className="inline-flex items-center gap-1">
                    <Mail className="size-3.5" />
                    {open.email}
                  </li>
                )}
                <li className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {a.plans(open.properties, open.city)}
                </li>
                <li>{date(open.appliedAt, "MMM d, yyyy")}</li>
              </ul>
            </div>

            {open.flags.length > 0 && (
              <div className="rounded-xl border border-warning/40 bg-warning/10 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-warning">
                  <AlertTriangle className="size-4" />
                  {a.flagsTitle}
                </p>
                <ul className="list-disc space-y-0.5 pl-5 text-sm">
                  {open.flags.map((f) => (
                    <li key={f}>{a.flags[f]}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-3 rounded-xl border border-border p-3">
              <Phone className="size-5 text-primary-sage" />
              <p className="flex-1 text-sm font-semibold">{a.checks.phone}</p>
              <Pill tone={open.checks.phone ? "ok" : "bad"}>{open.checks.phone ? a.phoneOk : a.phoneNo}</Pill>
            </div>

            {(
              [
                { key: "identity", icon: FileText, sub: a.idType[open.idType] },
                { key: "selfie", icon: ScanFace },
                { key: "payout", icon: Wallet, sub: a.payoutOptional },
              ] as const
            ).map(({ key, icon: Icon, ...rest }) => {
              const state = open.checks[key];
              return (
                <div key={key} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
                  <Icon className="size-5 text-primary-sage" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">
                      {a.checks[key]}
                      {"sub" in rest && <span className="ml-2 text-xs font-normal text-muted-foreground">{rest.sub}</span>}
                    </p>
                    <Pill tone={docTone(state)}>{docState[state]}</Pill>
                  </div>
                  {state !== "approved" && (
                    <div className="flex gap-2">
                      {state === "received" && (
                        <Button variant="outline" className="h-8 px-3" onClick={() => setCheck(open, key, "missing")}>
                          {a.askAgain}
                        </Button>
                      )}
                      <Button className="h-8 px-3" disabled={state === "missing"} onClick={() => setCheck(open, key, "approved")}>
                        {a.approveCheck}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <p className="flex items-start gap-2 text-sm text-muted-foreground">
                <BadgeCheck className="mt-0.5 size-4 shrink-0" />
                {canApproveHost(open) ? a.afterApprove : a.needsAll}
              </p>
              <label className="flex flex-col gap-1 text-xs font-medium">
                {a.reasonLabel}
                <select
                  value={reason}
                  onChange={(e) => setReason(Number(e.target.value))}
                  className="h-9 rounded-lg border border-input bg-transparent px-2 text-sm"
                >
                  <optgroup label={a.requestInfo}>
                    {a.infoReasons.map((r, i) => (
                      <option key={`i${i}`} value={i}>
                        {r}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={a.reject}>
                    {a.rejectReasons.map((r, i) => (
                      <option key={`r${i}`} value={a.infoReasons.length + i}>
                        {r}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  className="h-10 px-4 text-destructive"
                  disabled={reason < a.infoReasons.length}
                  onClick={() => decide(open, "rejected", [...a.infoReasons, ...a.rejectReasons][reason])}
                >
                  {a.reject}
                </Button>
                <Button
                  variant="outline"
                  className="h-10 px-4"
                  disabled={reason >= a.infoReasons.length}
                  onClick={() => decide(open, "info", a.infoReasons[reason])}
                >
                  {a.requestInfo}
                </Button>
                <Button
                  className="h-10 bg-accent-terracotta px-4 text-white hover:bg-terracotta-strong"
                  disabled={!canApproveHost(open)}
                  onClick={() => decide(open, "approved")}
                >
                  {a.approve}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
