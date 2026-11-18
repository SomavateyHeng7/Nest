"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { currentStaff } from "@/features/admin/data";

const STORAGE_KEY = "nest.admin.audit";

/**
 * Everything staff can do that changes something about a person, a listing or
 * money. Each action belongs to one category (used for filtering). Add new
 * actions here first, then give them a label in the dictionaries.
 */
export const auditActions = {
  "host.approved": "applications",
  "host.rejected": "applications",
  "host.infoRequested": "applications",
  "host.reopened": "applications",
  "host.checkApproved": "applications",
  "host.checkRequested": "applications",
  "verification.visitScheduled": "verifications",
  "verification.visitDone": "verifications",
  "verification.published": "verifications",
  "verification.changesRequested": "verifications",
  "verification.unpublished": "verifications",
  "doc.viewed": "documents",
  "doc.approved": "documents",
  "doc.rejected": "documents",
  "doc.deleted": "documents",
  "user.suspended": "users",
  "user.reactivated": "users",
  "user.idVerified": "users",
  "report.resolved": "reports",
  "report.reopened": "reports",
  "report.warned": "reports",
  "report.listingPaused": "reports",
  "report.listingResumed": "reports",
  "report.contacted": "reports",
  "dispute.investigating": "disputes",
  "dispute.noted": "disputes",
  "dispute.evidenceRequested": "disputes",
  "dispute.resolved": "disputes",
  "dispute.reopened": "disputes",
  "review.approved": "reviews",
  "review.hidden": "reviews",
  "review.removed": "reviews",
  "review.restored": "reviews",
  "review.reportDismissed": "reviews",
} as const;

export type AuditAction = keyof typeof auditActions;
export type AuditCategory = (typeof auditActions)[AuditAction];

export const auditCategories: AuditCategory[] = ["applications", "verifications", "documents", "users", "reports", "disputes", "reviews"];

export interface AuditEntry {
  id: string;
  /** ISO timestamp. */
  at: string;
  actor: string;
  action: AuditAction;
  /** Who or what it happened to: a person's name or a listing title. */
  target: string;
  /** Record id for cross-referencing, e.g. "dp-07". */
  ref?: string;
  /** Free text the staff member entered (a reason, a note). Never translated. */
  detail?: string;
}

export type AuditInput = Pick<AuditEntry, "action" | "target" | "ref" | "detail">;

/** History from before this session, so the log isn't empty on first open. */
const history: AuditEntry[] = [
  { id: "au-h8", at: "2026-11-18T16:42:00", actor: "Mealea Sok", action: "verification.visitDone", target: "2-bed townhouse, Sen Sok", ref: "vq-26" },
  { id: "au-h7", at: "2026-11-18T15:10:00", actor: "Mealea Sok", action: "doc.approved", target: "High-floor condo with Mekong views", ref: "vq-28", detail: "Right to rent" },
  { id: "au-h6", at: "2026-11-18T15:04:00", actor: "Mealea Sok", action: "doc.viewed", target: "High-floor condo with Mekong views", ref: "vq-28", detail: "Right to rent" },
  { id: "au-h5", at: "2026-11-17T11:30:00", actor: "Rithy Ouk", action: "dispute.evidenceRequested", target: "Emma Laurent", ref: "dp-07", detail: "Photos of the unit on move-in day" },
  { id: "au-h4", at: "2026-11-17T09:12:00", actor: "Rithy Ouk", action: "dispute.investigating", target: "Emma Laurent", ref: "dp-07" },
  { id: "au-h3", at: "2026-11-16T14:55:00", actor: "Mealea Sok", action: "user.suspended", target: "Visal Chhun", detail: "Repeated requests to pay outside Nest" },
  { id: "au-h2", at: "2026-11-16T10:20:00", actor: "Rithy Ouk", action: "host.approved", target: "Vibol Tan" },
  { id: "au-h1", at: "2026-11-15T17:45:00", actor: "Mealea Sok", action: "report.warned", target: "Linda Meas", ref: "rp-14" },
];

interface AuditContextValue {
  entries: AuditEntry[];
  /** Record a staff action. The actor and time are filled in here, so callers can't forge them. */
  log: (input: AuditInput) => void;
}

const AuditContext = createContext<AuditContextValue | null>(null);

/**
 * Append-only record of staff actions. There is deliberately no way to edit or
 * remove an entry. Prototype only: this session's entries live in localStorage
 * until there is a backend; a real one writes to a table the app can only insert into.
 */
export function AuditProvider({ children }: { children: React.ReactNode }) {
  const [recent, setRecent] = useState<AuditEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage after mount
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      // storage unavailable — the log just won't persist across reloads
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } catch {
      // ignore
    }
  }, [recent, ready]);

  const log = useCallback((input: AuditInput) => {
    const entry: AuditEntry = {
      ...input,
      id: `au-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
      actor: currentStaff.name,
    };
    setRecent((list) => [entry, ...list]);
  }, []);

  const value = useMemo(() => ({ entries: [...recent, ...history], log }), [recent, log]);
  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error("useAudit must be used inside AuditProvider");
  return ctx;
}
