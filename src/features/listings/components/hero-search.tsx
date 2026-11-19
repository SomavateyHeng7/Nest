"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, Clock, MapPin, Search } from "lucide-react";

import { StayLengthPicker } from "@/features/stays/components/stay-length-picker";
import { Button } from "@/shared/ui/button";
import { ANYWHERE, cities } from "@/features/listings/lib/destinations";
import type { StayLength } from "@/features/stays/lib/pricing";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

/** Labels sit above their field so what you read and what you fill in never blur together. */
const labelClass = "flex items-center gap-1.5 text-sm font-medium text-muted-foreground";
/** Every control is a visible, bordered box on the page background, set apart from the card. */
const fieldClass =
  "h-12 w-full rounded-xl border border-input bg-background px-3.5 text-base text-foreground shadow-xs outline-none transition-colors hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function HeroSearch() {
  const router = useRouter();
  const { d, t } = useI18n();
  const howLongId = useId();
  const [city, setCity] = useState("Phnom Penh");
  const [moveIn, setMoveIn] = useState("");
  const [stay, setStay] = useState<StayLength>({ amount: 3, unit: "months" });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (city !== ANYWHERE) params.set("city", city);
    if (moveIn) params.set("moveIn", moveIn);
    params.set("stay", `${stay.amount}-${stay.unit}`);
    router.push(`/listing?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid w-full grid-cols-1 gap-x-4 gap-y-5 rounded-3xl bg-card p-4 text-left shadow-2xl shadow-black/15 ring-1 ring-border sm:grid-cols-2 sm:p-6"
    >
      <label className="flex flex-col gap-2">
        <span className={labelClass}>
          <MapPin className="size-4 text-primary-sage" />
          {d.search.where}
        </span>
        <span className="relative">
          <select
            className={cn(fieldClass, "appearance-none pr-10")}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {[ANYWHERE, ...cities].map((c) => (
              <option key={c} value={c}>
                {c === ANYWHERE ? d.common.anywhere : t(c)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        </span>
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>
          <CalendarDays className="size-4 text-primary-sage" />
          {d.search.moveIn}
        </span>
        <input
          type="date"
          value={moveIn}
          onChange={(e) => setMoveIn(e.target.value)}
          className={cn(fieldClass, !moveIn && "text-muted-foreground")}
        />
      </label>

      <div role="group" aria-labelledby={howLongId} className="flex flex-col gap-2 sm:col-span-2">
        <span id={howLongId} className={labelClass}>
          <Clock className="size-4 text-primary-sage" />
          {d.search.howLong}
        </span>
        <StayLengthPicker value={stay} onChange={setStay} size="lg" />
      </div>

      <Button
        type="submit"
        className="h-12 gap-2 rounded-xl bg-cta px-6 text-base text-white hover:bg-cta-strong sm:col-span-2"
      >
        <Search className="size-4.5" />
        {d.search.submit}
      </Button>
    </form>
  );
}
