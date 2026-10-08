import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, MapPin } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AmenityIcon } from "@/components/listing/amenity-icon";
import { BookingSidebar } from "@/components/listing/booking-sidebar";
import { getListingById, listings } from "@/data/listings";

export function generateStaticParams() {
  return listings.map((listing) => ({ id: listing.id }));
}

export default async function ListingPage(props: PageProps<"/listing/[id]">) {
  const { id } = await props.params;
  const listing = getListingById(id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
        {listing.title}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="size-3.5 fill-current text-accent-terracotta" />
          {listing.rating.toFixed(2)} · {listing.reviewCount} reviews
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {listing.city}, {listing.province}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
        <div className="relative col-span-4 aspect-16/9 sm:col-span-2 sm:row-span-2 sm:aspect-auto">
          <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" priority />
        </div>
        {listing.images.slice(1, 3).map((src, i) => (
          <div key={src} className="relative col-span-2 hidden aspect-4/3 sm:block">
            <Image
              src={src}
              alt={`${listing.title} photo ${i + 2}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-medium text-foreground">
                Hosted by {listing.host.name}
                {listing.host.isSuperhost && (
                  <span className="ml-2 text-sm text-primary-sage">Superhost</span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground">
                {listing.guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds ·{" "}
                {listing.baths} baths
              </p>
            </div>
            <Avatar size="lg">
              <AvatarImage src={listing.host.avatarUrl} alt={listing.host.name} />
              <AvatarFallback>{listing.host.name.slice(0, 1)}</AvatarFallback>
            </Avatar>
          </div>

          <Separator />

          <p className="text-sm leading-relaxed text-foreground">{listing.description}</p>

          <Separator />

          <div>
            <h2 className="mb-4 font-medium text-foreground">What this place offers</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {listing.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2 text-sm text-foreground">
                  <AmenityIcon amenity={amenity} className="size-4 text-muted-foreground" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <BookingSidebar listing={listing} />
        </div>
      </div>
    </div>
  );
}
