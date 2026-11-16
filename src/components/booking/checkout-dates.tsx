"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertCircle, CalendarDays } from "lucide-react";

import { StayCalendar } from "@/components/listing/stay-calendar";
import { StayDraftProvider, useStayDraft } from "@/components/listing/stay-draft";
import { StayLengthPicker } from "@/components/listing/stay-length-picker";
import { useProblemText } from "@/components/listing/use-problem-text";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import type { StayLength } from "@/lib/pricing";
import { serializeStay } from "@/lib/search-params";
import type { Listing } from "@/types/listing";

function Editor({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { d } = useI18n();
  const { moveIn, stay, setStay, guests, problem } = useStayDraft();
  const problemText = useProblemText();

  function apply() {
    const params = new URLSearchParams({ moveIn, stay: serializeStay(stay), guests: String(guests) });
    // Server Components re-render the summary and totals from the new query.
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onClose();
  }

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-xl border border-border bg-background/60 p-3">
      <p className="text-sm font-semibold">{d.checkout.editTitle}</p>
      <StayCalendar months={1} className="[&_[data-slot=calendar]]:p-2" />
      <div>
        <span className="mb-1.5 block text-xs font-semibold">{d.book.stayLength}</span>
        <StayLengthPicker value={stay} onChange={setStay} compact />
      </div>
      {problem && (
        <p className="flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
          {problemText(problem)}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" className="h-9 px-3" onClick={onClose}>
          {d.checkout.cancel}
        </Button>
        <Button className="h-9 px-4" disabled={Boolean(problem)} onClick={apply}>
          {d.checkout.applyDates}
        </Button>
      </div>
    </div>
  );
}

/**
 * "Change dates" control for the request-to-book summary. Edits a draft seeded
 * from the current URL and writes it back on apply.
 */
export function CheckoutDates({
  listing,
  moveIn,
  stay,
  guests,
}: {
  listing: Listing;
  moveIn: string;
  stay: StayLength;
  guests: number;
}) {
  const { d } = useI18n();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="outline" className="mt-4 h-9 w-full gap-2" onClick={() => setOpen(true)}>
        <CalendarDays className="size-4" />
        {d.checkout.changeDates}
      </Button>
    );
  }

  return (
    // Keyed on the applied values so reopening starts from what's in the URL.
    <StayDraftProvider key={`${moveIn}|${serializeStay(stay)}|${guests}`} listing={listing} initial={{ moveIn, stay, guests }}>
      <Editor onClose={() => setOpen(false)} />
    </StayDraftProvider>
  );
}
