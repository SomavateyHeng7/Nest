"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, Grid2x2, X } from "lucide-react";

import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

/** Horizontal distance (px) a finger has to travel to count as a swipe. */
const SWIPE_DISTANCE = 48;

/**
 * Phones: a swipeable, scroll-snapped strip of every photo with a counter.
 * `sm` and up: the existing hero + four-tile grid.
 * Tapping any photo opens a full-screen viewer (arrow keys, swipe, thumbnails).
 */
export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const { d } = useI18n();
  const stripRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [viewerAt, setViewerAt] = useState<number | null>(null);

  function handleScroll() {
    const el = stripRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  const alt = (i: number) => (i === 0 ? title : `${title} — ${d.listing.photo(i + 1)}`);
  const open = (i: number) => setViewerAt(i);

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
            <button
              type="button"
              key={src + i}
              onClick={() => open(i)}
              aria-label={d.listing.openPhoto(i + 1)}
              className="relative w-full shrink-0 snap-center snap-always"
            >
              <Image src={src} alt={alt(i)} fill preload={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <span
              className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular backdrop-blur-sm"
              aria-live="polite"
            >
              {d.listing.photoCount(index + 1, images.length)}
            </span>
            <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-3.5 flex justify-center gap-1.5">
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

      <div className="relative mt-6 hidden h-[440px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl sm:grid">
        <button
          type="button"
          onClick={() => open(0)}
          aria-label={d.listing.openPhoto(1)}
          className="relative col-span-2 row-span-2"
        >
          <Image src={images[0]} alt={title} fill preload sizes="50vw" className="object-cover transition-opacity hover:opacity-90" />
        </button>
        {images.slice(1, 5).map((src, i) => (
          <button
            type="button"
            key={src + i}
            onClick={() => open(i + 1)}
            aria-label={d.listing.openPhoto(i + 2)}
            className="relative"
          >
            <Image src={src} alt={alt(i + 1)} fill sizes="25vw" className="object-cover transition-opacity hover:opacity-90" />
          </button>
        ))}
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => open(0)}
            className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-3.5 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
          >
            <Grid2x2 className="size-4" aria-hidden />
            {d.listing.showAllPhotos(images.length)}
          </button>
        )}
      </div>

      <PhotoViewer images={images} title={title} at={viewerAt} onAtChange={setViewerAt} />
    </>
  );
}

function PhotoViewer({
  images,
  title,
  at,
  onAtChange,
}: {
  images: string[];
  title: string;
  at: number | null;
  onAtChange: (index: number | null) => void;
}) {
  const { d } = useI18n();
  const touchX = useRef<number | null>(null);
  const isOpen = at !== null;
  const current = at ?? 0;
  const last = images.length - 1;

  const go = (next: number) => onAtChange(Math.min(last, Math.max(0, next)));

  function handleKeyDown(e: React.KeyboardEvent) {
    // Reading order flips in no locale we ship, so arrows map to previous/next directly.
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(current - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(current + 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(last);
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchX.current;
    touchX.current = null;
    if (start === null) return;
    const delta = e.changedTouches[0].clientX - start;
    if (Math.abs(delta) < SWIPE_DISTANCE) return;
    go(current + (delta < 0 ? 1 : -1));
  }

  const navButton =
    "absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-30";

  return (
    <Dialog.Root open={isOpen} onOpenChange={(next) => !next && onAtChange(null)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          onKeyDown={handleKeyDown}
          className="fixed inset-0 z-50 flex flex-col text-white outline-none transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0"
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Dialog.Title className="truncate text-sm font-medium">
              <span className="sr-only">{d.listing.photoViewer}: </span>
              {title}
              <span className="ml-3 text-white/70 tabular">{d.listing.photoCount(current + 1, images.length)}</span>
            </Dialog.Title>
            <Dialog.Close
              aria-label={d.listing.closeViewer}
              className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>

          <div
            className="relative min-h-0 flex-1"
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={handleTouchEnd}
          >
            {isOpen && (
              <Image
                key={current}
                src={images[current]}
                alt={current === 0 ? title : `${title} — ${d.listing.photo(current + 1)}`}
                fill
                sizes="100vw"
                className="object-contain"
                preload
              />
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className={cn(navButton, "left-3 sm:left-6")}
                  onClick={() => go(current - 1)}
                  disabled={current === 0}
                  aria-label={d.listing.previousPhoto}
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  className={cn(navButton, "right-3 sm:right-6")}
                  onClick={() => go(current + 1)}
                  disabled={current === last}
                  aria-label={d.listing.nextPhoto}
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div
              role="group"
              aria-label={d.listing.viewerPhotos}
              className="flex shrink-0 gap-2 overflow-x-auto px-4 py-3 scrollbar-none sm:justify-center sm:px-6"
            >
              {images.map((src, i) => (
                <button
                  type="button"
                  key={src + i}
                  onClick={() => go(i)}
                  aria-label={d.listing.openPhoto(i + 1)}
                  aria-current={i === current}
                  className={cn(
                    "relative h-14 w-20 shrink-0 overflow-hidden rounded-md outline-offset-2 transition-opacity focus-visible:outline-2 focus-visible:outline-white",
                    i === current ? "opacity-100 ring-2 ring-white" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
