"use client";

import { useMemo } from "react";

import { reviews as published, summarize } from "@/features/reviews/data";
import type { Review } from "@/features/reviews/types";
import { createPersistedStore } from "@/shared/lib/persisted-store";

export type ReviewDecision = "approved" | "hidden" | "removed";
/**
 * published: counts towards ratings and is shown to everyone.
 * pending:   written by a renter, waiting for Nest staff.
 * hidden:    taken down but can be restored.
 * removed:   taken down for good.
 */
export type ReviewStatus = "published" | "pending" | "hidden" | "removed";

export const reportReasons = ["notReal", "offensive", "personal", "spam", "unfair"] as const;
export type ReportReason = (typeof reportReasons)[number];

export interface ReviewReport {
  id: string;
  reviewId: string;
  reason: ReportReason;
  at: string;
  status: "open" | "dismissed" | "actioned";
}

interface State {
  /** Reviews written in this browser. Everything else comes from `reviews/data`. */
  mine: Review[];
  /** Owner replies written in this browser, by review id. */
  replies: Record<string, { text: string; at: string }>;
  /** Staff decisions by review id. A sample review with no decision is published; a new one is pending. */
  decisions: Record<string, ReviewDecision>;
  reports: ReviewReport[];
}

const useStore = createPersistedStore<State>("nest.reviews", { mine: [], replies: {}, decisions: {}, reports: [] });

const newest = (a: Review, b: Review) => b.at.localeCompare(a.at);

/**
 * Everything about reviews in one place: what is shown, what is waiting for
 * staff, and the actions for writing, replying, reporting and moderating.
 * Prototype data lives in localStorage; a backend replaces `useStore`.
 */
export function useReviews() {
  const [state, update] = useStore();

  return useMemo(() => {
    const all = [...state.mine, ...published];
    const isMine = (r: Review) => state.mine.some((m) => m.id === r.id);

    const statusOf = (r: Review): ReviewStatus => {
      const decision = state.decisions[r.id];
      if (decision === "removed") return "removed";
      if (decision === "hidden") return "hidden";
      if (decision === "approved") return "published";
      return isMine(r) ? "pending" : "published";
    };

    const withStatus = (status: ReviewStatus) => all.filter((r) => statusOf(r) === status).sort(newest);
    const publishedFor = (listingId: string) => withStatus("published").filter((r) => r.listingId === listingId);

    return {
      statusOf,
      /** True for reviews written in this browser (as opposed to the sample ones). */
      isMine,
      find: (id: string) => all.find((r) => r.id === id),
      /** Every review of a home whatever its status, newest first. For staff. */
      allFor: (listingId: string) => all.filter((r) => r.listingId === listingId).sort(newest),
      /** Shown to everyone for one home, newest first. */
      publishedFor,
      summary: (listingId: string) => summarize(publishedFor(listingId)),
      /** Reviews this browser wrote that staff haven't approved yet. */
      pendingFor: (listingId: string) => state.mine.filter((r) => r.listingId === listingId && statusOf(r) === "pending"),
      /** The review written for a stay, whatever its status. */
      forStay: (stayId: string) => state.mine.find((r) => r.stayId === stayId),
      replyFor: (r: Review) => r.reply ?? state.replies[r.id],
      withStatus,
      reports: state.reports,
      openReports: state.reports.filter((x) => x.status === "open"),

      addReview: (input: Omit<Review, "id" | "at">) =>
        update((s) => {
          const review: Review = { ...input, id: `rv-${crypto.randomUUID()}`, at: new Date().toISOString() };
          // One review per stay: writing again replaces the earlier one, and waits for staff again.
          const old = s.mine.find((x) => x.stayId === input.stayId);
          const decisions = { ...s.decisions };
          if (old) delete decisions[old.id];
          return { ...s, mine: [review, ...s.mine.filter((x) => x.id !== old?.id)], decisions };
        }),

      addReply: (reviewId: string, text: string) =>
        update((s) => ({ ...s, replies: { ...s.replies, [reviewId]: { text, at: new Date().toISOString() } } })),

      report: (reviewId: string, reason: ReportReason) =>
        update((s) =>
          s.reports.some((x) => x.reviewId === reviewId && x.reason === reason && x.status === "open")
            ? s
            : { ...s, reports: [{ id: `rr-${crypto.randomUUID()}`, reviewId, reason, at: new Date().toISOString(), status: "open" }, ...s.reports] }
        ),

      /** Staff decision. `null` clears it, which puts a sample review back to published and a new one back to pending. */
      moderate: (reviewId: string, decision: ReviewDecision | null) =>
        update((s) => {
          const decisions = { ...s.decisions };
          if (decision) decisions[reviewId] = decision;
          else delete decisions[reviewId];
          const takenDown = decision === "hidden" || decision === "removed";
          return {
            ...s,
            decisions,
            reports: takenDown ? s.reports.map((x) => (x.reviewId === reviewId && x.status === "open" ? { ...x, status: "actioned" as const } : x)) : s.reports,
          };
        }),

      dismissReports: (reviewId: string) =>
        update((s) => ({ ...s, reports: s.reports.map((x) => (x.reviewId === reviewId && x.status === "open" ? { ...x, status: "dismissed" as const } : x)) })),
    };
  }, [state, update]);
}
