"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Search } from "lucide-react";

import { StayLengthPicker } from "@/features/stays/components/stay-length-picker";
import { Button } from "@/shared/ui/button";
import { ANYWHERE, cities } from "@/features/listings/lib/destinations";
import type { StayLength } from "@/features/stays/lib/pricing";
import { useI18n } from "@/i18n/client";

export function HeroSearch() {
  const router = useRouter();
  const { d, t } = useI18n();
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
      className="grid grid-cols-1 w-full gap-1 rounded-2xl bg-card p-2 text-left shadow-2xl shadow-black/20 ring-1 ring-black/5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] md:items-center"
    >
      <label className="flex flex-col gap-1 rounded-xl px-4 py-2.5 hover:bg-muted/60">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <MapPin className="size-3.5 text-primary-sage" />
          {d.search.where}
        </span>
        <select
          className="-ml-0.5 bg-transparent text-sm text-foreground outline-none"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {[ANYWHERE, ...cities].map((c) => (
            <option key={c} value={c}>
              {c === ANYWHERE ? d.common.anywhere : t(c)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 rounded-xl px-4 py-2.5 hover:bg-muted/60 md:border-l md:border-border">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <CalendarDays className="size-3.5 text-primary-sage" />
          {d.search.moveIn}
        </span>
        <input
          type="date"
          value={moveIn}
          onChange={(e) => setMoveIn(e.target.value)}
          className="bg-transparent text-sm text-foreground outline-none"
        />
      </label>

      <div className="flex flex-col gap-1.5 rounded-xl px-4 py-2.5 md:border-l md:border-border">
        <span className="text-xs font-semibold text-foreground">{d.search.howLong}</span>
        <StayLengthPicker value={stay} onChange={setStay} compact />
      </div>

      <Button
        type="submit"
        className="h-12 gap-2 rounded-xl bg-accent-terracotta px-6 text-base text-white hover:bg-terracotta-strong md:h-14"
      >
        <Search className="size-4.5" />
        {d.search.submit}
      </Button>
    </form>
  );
}
