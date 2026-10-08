"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ANYWHERE, destinations } from "@/lib/destinations";

export function ListingFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const destination = searchParams.get("destination") ?? ANYWHERE;
  const guests = searchParams.get("guests") ?? "1";
  const hasFilters = searchParams.get("destination") || searchParams.get("guests");

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ANYWHERE || value === "1") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    const query = params.toString();
    router.push(query ? `/listing?${query}` : "/listing");
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Where</span>
        <select
          className="rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground outline-none"
          value={destination}
          onChange={(event) => updateParam("destination", event.target.value)}
        >
          {destinations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Guests</span>
        <Input
          type="number"
          min={1}
          value={guests}
          onChange={(event) => updateParam("guests", event.target.value)}
          className="h-8 w-16"
        />
      </label>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/listing")}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
