export const scoreKeys = ["accuracy", "cleanliness", "communication"] as const;
export type ScoreKey = (typeof scoreKeys)[number];

export interface Review {
  id: string;
  listingId: string;
  /** The completed stay this review is about. Only renters who stayed can review. */
  stayId?: string;
  /** First name and initial, e.g. "Emma L." — never a full name. */
  author: string;
  /** Overall score, 1–5. */
  rating: number;
  /** "accuracy" is whether the home matched its listing, the thing verification promises. */
  scores: Record<ScoreKey, number>;
  text: string;
  /** Language the review was written in, for the `lang` attribute. */
  lang: "en" | "km";
  stayNights: number;
  /** ISO date the review was posted. */
  at: string;
  reply?: { text: string; at: string };
}

export interface ReviewSummary {
  count: number;
  /** Average overall rating, one decimal. 0 when there are no reviews. */
  average: number;
  /** Review counts for 5, 4, 3, 2, 1 stars, in that order. */
  distribution: number[];
  categories: Record<ScoreKey, number>;
}
