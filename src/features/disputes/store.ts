"use client";

import { useMemo } from "react";

import { disputes as sample, type Dispute, type DisputeKind, type DisputeParty } from "@/features/admin/data";
import { createPersistedStore } from "@/shared/lib/persisted-store";

/** Bump the suffix when the sample data changes shape, so old browser copies don't linger. */
const useStore = createPersistedStore<{ items: Dispute[] }>("nest.disputes.v1", { items: sample });

export interface NewDispute {
  listingId: string;
  kind: DisputeKind;
  openedBy: DisputeParty;
  renter: string;
  owner: string;
  held: number;
  stay: { moveIn: string; moveOut: string };
  summary: string;
  /** File names only. Files are not uploaded anywhere in this prototype. */
  evidence: string[];
}

const nextId = (items: Dispute[]) => {
  const max = items.reduce((m, d) => Math.max(m, Number(d.id.replace(/\D/g, "")) || 0), 0);
  return `dp-${String(max + 1).padStart(2, "0")}`;
};

/**
 * Every dispute, from sample cases to ones renters and owners open themselves.
 * Staff and the two people see the same list; staff-only notes are filtered out
 * wherever the people look (see `visibleTimeline`).
 */
export function useDisputes() {
  const [state, update] = useStore();

  return useMemo(() => {
    const patch = (id: string, fn: (d: Dispute) => Dispute) => update((s) => ({ items: s.items.map((d) => (d.id === id ? fn(d) : d)) }));
    const now = () => new Date().toISOString();
    const uid = () => `ev-${crypto.randomUUID()}`;

    return {
      items: state.items,
      patch,
      /** For the two people involved: their own disputes, newest first. */
      forPerson: (party: DisputeParty, name: string) =>
        state.items.filter((d) => (party === "renter" ? d.renter : d.owner) === name).sort((a, b) => b.openedAt.localeCompare(a.openedAt)),

      open: (input: NewDispute): string => {
        let id = "";
        update((s) => {
          id = nextId(s.items);
          const by = input.openedBy === "renter" ? input.renter : input.owner;
          const at = now();
          const dispute: Dispute = {
            id,
            listingId: input.listingId,
            kind: input.kind,
            status: "open",
            openedBy: input.openedBy,
            renter: input.renter,
            owner: input.owner,
            held: input.held,
            stay: input.stay,
            openedAt: at,
            summary: input.summary,
            evidence: input.evidence.map((name) => ({ id: uid(), from: input.openedBy, name, at })),
            timeline: [{ id: uid(), at, kind: "message", by, party: input.openedBy, text: input.summary }],
          };
          return { items: [dispute, ...s.items] };
        });
        return id;
      },

      addMessage: (id: string, party: DisputeParty, by: string, text: string) =>
        patch(id, (d) => ({ ...d, timeline: [...d.timeline, { id: uid(), at: now(), kind: "message", by, party, text }] })),

      addEvidence: (id: string, party: DisputeParty, names: string[]) =>
        patch(id, (d) => ({ ...d, evidence: [...d.evidence, ...names.map((name) => ({ id: uid(), from: party, name, at: now() }))] })),
    };
  }, [state, update]);
}

/** What the two people may see: everything except staff's internal notes. */
export const visibleTimeline = (d: Dispute) => d.timeline.filter((e) => e.kind !== "note");
