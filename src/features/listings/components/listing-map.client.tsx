"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { useI18n } from "@/i18n/client";

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

/** Keeps every result in view when the result set changes. */
function FitToResults({ points }: { points: LatLng[] }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat},${p.lng}`).join("|");
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [48, 48], maxZoom: 15 });
    // `key` captures the points; the array itself is new on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
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
  // One icon per listing, rebuilt only when results or prices change, so
  // re-renders don't replace every pin's element (and drop keyboard focus).
  const pins = useMemo(
    () =>
      listings.map((l) => {
        const price = money(priceOf(l));
        return { listing: l, price, icon: priceIcon(price) };
      }),
    [listings, priceOf, money]
  );

  return (
    <div className={className} role="region" aria-label={d.map.resultsLabel}>
      <MapContainer
        center={points[0] ?? FALLBACK_CENTER}
        zoom={12}
        maxZoom={MAX_ZOOM}
        scrollWheelZoom
        className="size-full"
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} />
        <FitToResults points={points} />
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

