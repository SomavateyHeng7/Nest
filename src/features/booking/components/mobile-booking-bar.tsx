"use client";

import { useStayDraft } from "@/features/stays/components/stay-draft";
import { useI18n } from "@/i18n/client";
import { formatUSD, quoteStay } from "@/features/stays/lib/pricing";

/** Phones: keeps the total for the chosen stay and the main action in reach while scrolling. */
export function MobileBookingBar() {
  const { d } = useI18n();
  const { listing, stay, nights } = useStayDraft();
  const quote = quoteStay(listing.pricing, nights);

  return (
    <div data-mobile-booking-bar className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      <p className="min-w-0">
        <span className="text-lg font-semibold tabular">{formatUSD(quote.rentTotal)}</span>
        <span className="text-sm text-muted-foreground"> {d.card.totalFor(d.stay.format(stay))}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {d.rate[quote.tier](formatUSD(quote.rate))} · {d.common.noRenterFees}
        </span>
      </p>
      <a
        href="#book"
        className="inline-flex h-12 shrink-0 items-center rounded-xl bg-accent-terracotta px-5 text-sm font-medium text-white hover:bg-terracotta-strong"
      >
        {d.book.request}
      </a>
    </div>
  );
}
