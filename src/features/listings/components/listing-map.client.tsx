"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import L from "leaflet";
import { Search } from "lucide-react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

import type { LatLng, Listing } from "@/features/listings/types";

/**
 * Map tiles. Defaults to the public OpenStreetMap server, which needs no key but
 * is only meant for light use. Before launch, set NEXT_PUBLIC_MAP_TILE_URL to a
 * tile provider (MapTiler, Stadia, Mapbox…) and NEXT_PUBLIC_MAP_ATTRIBUTION to match.
 */
const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Closest zoom allowed (about street-block level). Locations are approximate by
 * design, so zooming further would suggest a precision they don't have.
 */
const MAX_ZOOM = 16;

/** Phnom Penh, used when there's nothing to show. */
const FALLBACK_CENTER: LatLng = { lat: 11.5564, lng: 104.9282 };

/** A price pill centred on the point (styled in globals.css). `label` is a formatted price, never user text. */
function priceIcon(label: string) {
  return L.divIcon({
    className: "", // drop Leaflet's default white square
    html: `<span class="nest-price-pin">${label}</span>`,
    iconSize: undefined, // let the pill size itself
    iconAnchor: [0, 0],
    popupAnchor: [0, -14],
  });
}

/**
 * Keeps every result in view when the result set changes, or when `refit` changes
 * (the "show all results" button). Moves without animation and inside `programmatic`,
 * so `MoveWatcher` can tell these moves apart from the visitor's own.
 */
function FitToResults({ points, refit, programmaticRef }: { points: LatLng[]; refit: number; programmaticRef: RefObject<boolean> }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat},${p.lng}`).join("|");
  useEffect(() => {
    if (points.length === 0) return;
    programmaticRef.current = true;
    try {
      if (points.length === 1) {
        map.setView(points[0], 14, { animate: false });
      } else {
        map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), {
          padding: [48, 48],
          maxZoom: 15,
          animate: false,
        });
      }
    } finally {
      // Without animation Leaflet fires `moveend` before returning, so the flag is safe to drop here.
      programmaticRef.current = false;
    }
    // `key` captures the points; the array itself is new on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key, refit]);
  return null;
}

/** How long after a popup opens its auto-pan can still be moving the map. */
const POPUP_PAN_MS = 600;

/** Reports the visible area after the visitor drags or zooms (not after our own fits or popup auto-pans). */
function MoveWatcher({ onMove, programmaticRef }: { onMove: (bounds: L.LatLngBounds) => void; programmaticRef: RefObject<boolean> }) {
  const popupPanRef = useRef(false);
  const map = useMapEvents({
    popupopen: () => {
      popupPanRef.current = true;
      setTimeout(() => {
        popupPanRef.current = false;
      }, POPUP_PAN_MS);
    },
    moveend: () => {
      if (programmaticRef.current || popupPanRef.current) return;
      onMove(map.getBounds());
    },
  });
  return null;
}

export interface ResultsMapProps {
  listings: Listing[];
  /** Price shown on each pin, e.g. the total rent for the searched stay. */
  priceOf: (listing: Listing) => number;
  className?: string;
}

/** Search results as price pins; each pin opens a small card linking to the listing. */
export function ResultsMap({ listings, priceOf, className }: ResultsMapProps) {
  const { d, t, lt, money } = useI18n();
  const points = useMemo(() => listings.map((l) => l.location), [listings]);
  const listingsKey = listings.map((l) => l.id).join("|");

  const programmaticRef = useRef(false);
  const [autoSearch, setAutoSearch] = useState(false);
  const [refit, setRefit] = useState(0);
  // The searched area belongs to one result set: when filters change the results, it stops applying.
  const [applied, setApplied] = useState<{ key: string; bounds: L.LatLngBounds } | null>(null);
  const [pending, setPending] = useState<{ key: string; bounds: L.LatLngBounds } | null>(null);
  const area = applied?.key === listingsKey ? applied.bounds : null;
  const waiting = pending?.key === listingsKey && !autoSearch ? pending.bounds : null;

  function handleMove(bounds: L.LatLngBounds) {
    if (autoSearch) setApplied({ key: listingsKey, bounds });
    else setPending({ key: listingsKey, bounds });
  }

  function searchHere() {
    if (!waiting) return;
    setApplied({ key: listingsKey, bounds: waiting });
    setPending(null);
  }

  function showAll() {
    setApplied(null);
    setPending(null);
    setRefit((n) => n + 1);
  }

  const visible = useMemo(() => (area ? listings.filter((l) => area.contains(l.location)) : listings), [listings, area]);

  // One icon per listing, rebuilt only when results or prices change, so
  // re-renders don't replace every pin's element (and drop keyboard focus).
  const pins = useMemo(
    () =>
      visible.map((l) => {
        const price = money(priceOf(l));
        return { listing: l, price, icon: priceIcon(price) };
      }),
    [visible, priceOf, money]
  );

  const chip =
    "pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-3.5 py-2 text-sm font-medium text-foreground shadow-md backdrop-blur-sm";

  return (
    <div className={cn("relative", className)} role="region" aria-label={d.map.resultsLabel}>
      <MapContainer
        center={points[0] ?? FALLBACK_CENTER}
        zoom={12}
        maxZoom={MAX_ZOOM}
        scrollWheelZoom
        className="size-full"
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        <FitToResults points={points} refit={refit} programmaticRef={programmaticRef} />
        <MoveWatcher onMove={handleMove} programmaticRef={programmaticRef} />
        {pins.map(({ listing: l, price, icon }) => (
          <Marker
            key={l.id}
            position={l.location}
            icon={icon}
            title={lt(l).text}
            alt={lt(l).text}
            riseOnHover
          >
            <Popup minWidth={220} maxWidth={240}>
              <Link href={`/listing/${l.id}`} className="block w-[220px] text-foreground no-underline">
                <span className="relative block aspect-4/3 overflow-hidden rounded-lg">
                  <Image src={l.images[0]} alt="" fill sizes="220px" className="object-cover" />
                </span>
                <span className="mt-2 block text-sm leading-snug font-semibold" lang={lt(l).lang}>
                  {lt(l).text}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t(l.district)}, {t(l.city)} · {price}
                </span>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlays sit above Leaflet's panes (which go up to z-index 700) and let drags through elsewhere. */}
      <div className="pointer-events-none absolute inset-x-3 top-3 z-[1000] flex flex-col items-center gap-2">
        {waiting && (
          <button type="button" onClick={searchHere} className={cn(chip, "hover:bg-background")}>
            <Search className="size-4" aria-hidden />
            {d.map.searchArea}
          </button>
        )}
      </div>
      <label className={cn(chip, "absolute top-3 right-3 z-[1000] cursor-pointer gap-2 text-xs sm:text-sm")}>
        <input
          type="checkbox"
          checked={autoSearch}
          onChange={(e) => setAutoSearch(e.target.checked)}
          className="size-4 accent-[var(--color-dark-forest)]"
        />
        {d.map.searchAsMove}
      </label>
      <div className="pointer-events-none absolute bottom-6 left-3 z-[1000] flex flex-col items-start gap-2">
        {visible.length === 0 && (
          <p className={cn(chip, "max-w-xs font-normal")} role="status">
            {d.map.nothingInArea}
          </p>
        )}
        <div className="flex items-center gap-2">
          <p className={chip} role="status" aria-live="polite">
            {d.map.inView(visible.length, listings.length)}
          </p>
          {area && (
            <button type="button" onClick={showAll} className={cn(chip, "hover:bg-background")}>
              {d.map.showAll}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The listing's neighbourhood as a shaded circle, not a pin, so the exact
 * address stays private until a booking is confirmed.
 */
export function AreaMap({ location, className }: { location: LatLng; className?: string }) {
  const { d } = useI18n();
  return (
    <div className={className} role="region" aria-label={d.map.areaLabel}>
      <MapContainer center={location} zoom={15} maxZoom={MAX_ZOOM} scrollWheelZoom={false} className="size-full">
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        <Circle
          center={location}
          radius={400}
          // Colours come from the theme in globals.css; SVG attributes can't read CSS variables.
          pathOptions={{ className: "nest-area-circle", weight: 2 }}
        />
      </MapContainer>
    </div>
  );
}

