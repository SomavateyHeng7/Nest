import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/types/listing";

const categoryLabel: Record<Listing["category"], string> = {
  apartment: "Apartment",
  villa: "Villa",
  guesthouse: "Guesthouse",
  "riverside-bungalow": "Riverside bungalow",
  "boutique-hotel": "Boutique hotel",
};

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group flex flex-col gap-2 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
        <Image
          src={listing.images[0]}
          alt={listing.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge variant="secondary" className="absolute left-2 top-2 bg-surface-white/90 text-text-charcoal">
          {categoryLabel[listing.category]}
        </Badge>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-medium text-foreground">
            {listing.city}, {listing.province}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
            <Star className="size-3.5 fill-current text-accent-terracotta" />
            {listing.rating.toFixed(2)}
          </span>
        </div>
        <p className="line-clamp-1 text-sm text-muted-foreground">{listing.title}</p>
        <p className="mt-1 text-sm text-foreground">
          <span className="font-medium">${listing.pricePerNight}</span>{" "}
          <span className="text-muted-foreground">night</span>
        </p>
      </div>
    </Link>
  );
}
