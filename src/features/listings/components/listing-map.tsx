"use client";

import dynamic from "next/dynamic";

import { cn } from "@/shared/lib/utils";

/*
 * Leaflet touches `window` when it loads, so the maps render only in the
 * browser. The placeholder keeps the same box, so nothing jumps when they appear.
 */
function MapPlaceholder() {
  return <div className="size-full animate-pulse bg-muted" />;
}

const ResultsMapInner = dynamic(() => import("./listing-map.client").then((m) => m.ResultsMap), {
  ssr: false,
  loading: MapPlaceholder,
});

const AreaMapInner = dynamic(() => import("./listing-map.client").then((m) => m.AreaMap), {
  ssr: false,
  loading: MapPlaceholder,
});

type ResultsProps = React.ComponentProps<typeof ResultsMapInner>;
type AreaProps = React.ComponentProps<typeof AreaMapInner>;

// The sized box lives out here, so the loading placeholder fills the same space as the map.
const frame = "nest-map overflow-hidden rounded-2xl border border-border";

export function ResultsMap({ className, ...props }: ResultsProps) {
  return (
    <div className={cn(frame, className)}>
      <ResultsMapInner {...props} className="size-full" />
    </div>
  );
}

export function AreaMap({ className, ...props }: AreaProps) {
  return (
    <div className={cn(frame, className)}>
      <AreaMapInner {...props} className="size-full" />
    </div>
  );
}
