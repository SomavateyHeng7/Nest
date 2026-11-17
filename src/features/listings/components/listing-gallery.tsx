"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { useI18n } from "@/i18n/client";

/**
 * Phones: a swipeable, scroll-snapped strip of every photo with a counter.
 * `sm` and up: the existing hero + four-tile grid.
 */
export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const { d } = useI18n();
  const stripRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function handleScroll() {
    const el = stripRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  const alt = (i: number) => (i === 0 ? title : `${title} — ${d.listing.photo(i + 1)}`);

  return (
    <>
      <div className="relative mt-6 -mx-4 sm:hidden">
        <div
          ref={stripRef}
          onScroll={handleScroll}
          role="region"
          aria-roledescription="carousel"
          aria-label={d.listing.photos}
          tabIndex={0}
          className="flex aspect-4/3 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scrollbar-none"
        >
          {images.map((src, i) => (
            <div key={src + i} className="relative w-full shrink-0 snap-center snap-always">
              <Image src={src} alt={alt(i)} fill preload={i === 0} sizes="100vw" className="object-cover" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <span
              className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular backdrop-blur-sm"
              aria-live="polite"
            >
              {d.listing.photoCount(index + 1, images.length)}
            </span>
            <span aria-hidden className="absolute inset-x-0 bottom-3.5 flex justify-center gap-1.5">
              {images.map((src, i) => (
                <span
                  key={src + i}
                  className={i === index ? "size-1.5 rounded-full bg-white" : "size-1.5 rounded-full bg-white/50"}
                />
              ))}
            </span>
          </>
        )}
      </div>

      <div className="mt-6 hidden h-[440px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl sm:grid">
        <div className="relative col-span-2 row-span-2">
          <Image src={images[0]} alt={title} fill preload sizes="50vw" className="object-cover" />
        </div>
        {images.slice(1, 5).map((src, i) => (
          <div key={src + i} className="relative">
            <Image src={src} alt={alt(i + 1)} fill sizes="25vw" className="object-cover" />
          </div>
        ))}
      </div>
    </>
  );
}
