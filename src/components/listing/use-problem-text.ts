"use client";

import type { StayProblem } from "@/components/listing/stay-draft";
import { useI18n } from "@/i18n/client";

/** Human-readable reason a draft stay can't be booked. */
export function useProblemText() {
  const { d, date } = useI18n();
  return (p: StayProblem) => {
    switch (p.kind) {
      case "min":
        return d.book.minStay(p.nights);
      case "max":
        return d.book.maxStay(p.months);
      case "noDate":
        return d.book.chooseDate;
      case "early":
        return d.book.availableFrom(date(p.from, "MMM d"));
      case "clash":
        return d.book.clash(date(p.start, "MMM d"), date(p.end, "MMM d"));
    }
  };
}
