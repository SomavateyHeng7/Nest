import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  CalendarClock,
  ChevronLeft,
  Clock,
  Languages,
  MapPin,
  Ruler,
  Sofa,
  Users,
  Zap,
} from "lucide-react";

import { SaveButton } from "@/features/renter/components/save-button";
import { AreaMap } from "@/features/listings/components/listing-map";
import { AmenityIcon } from "@/features/listings/components/amenity-icon";
import { BookingSidebar } from "@/features/booking/components/booking-sidebar";
import { MobileBookingBar } from "@/features/booking/components/mobile-booking-bar";
import { ListingGallery } from "@/features/listings/components/listing-gallery";
import { OwnerDescription } from "@/features/listings/components/owner-text";
import { StayCalendar } from "@/features/stays/components/stay-calendar";
import { StayDraftProvider } from "@/features/stays/components/stay-draft";
import { VerificationPanel } from "@/features/listings/components/verification-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { getListingById } from "@/features/listings/data";
import { ListingRating } from "@/features/reviews/components/listing-rating";
import { ListingReviews } from "@/features/reviews/components/listing-reviews";
import { getReviewSummary } from "@/features/reviews/data";
import { getI18n } from "@/i18n/server";
import { listingDescription, listingTitle } from "@/features/listings/lib/listing-text";

import { SITE_URL } from "@/shared/lib/site";
import type { Listing } from "@/features/listings/types";

function metaDescription(text: string) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > 160 ? `${flat.slice(0, 157).trimEnd()}…` : flat;
}

export async function generateMetadata(props: PageProps<"/listing/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const listing = getListingById(id);
  const { locale } = await getI18n();
  if (!listing) return { title: "Listing" };

  const title = listingTitle(listing, locale).text;
  const description = metaDescription(listingDescription(listing, locale).text);
  const image = listing.images[0];
  return {
    title,
    description,
    alternates: { canonical: `/listing/${listing.id}` },
    openGraph: { type: "website", title, description, url: `/listing/${listing.id}`, images: image ? [{ url: image, alt: title }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

const SCHEMA_TYPE: Record<Listing["type"], string> = {
  condo: "Apartment",
  apartment: "Apartment",
  "service-apartment": "Apartment",
  room: "Room",
  house: "House",
};

/** schema.org structured data so search engines can show price, rating and location. */
function listingJsonLd(listing: Listing, name: string, description: string) {
  const reviewSummary = getReviewSummary(listing.id);
  return {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[listing.type],
    name,
    description,
    url: `${SITE_URL}/listing/${listing.id}`,
    image: listing.images,
    numberOfBedrooms: listing.bedrooms,
    numberOfBathroomsTotal: listing.baths,
    floorSize: { "@type": "QuantitativeValue", value: listing.sizeSqm, unitCode: "MTK" },
    occupancy: { "@type": "QuantitativeValue", maxValue: listing.maxGuests },
    amenityFeature: listing.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a, value: true })),
    address: { "@type": "PostalAddress", addressLocality: listing.city, addressRegion: listing.district, addressCountry: "KH" },
    ...(reviewSummary.count > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: reviewSummary.average, reviewCount: reviewSummary.count },
    }),
    offers: {
      "@type": "Offer",
      price: listing.pricing.monthly,
      priceCurrency: "USD",
      url: `${SITE_URL}/listing/${listing.id}`,
      availability: "https://schema.org/InStock",
      priceSpecification: { "@type": "UnitPriceSpecification", price: listing.pricing.monthly, priceCurrency: "USD", unitCode: "MON" },
    },
  };
}

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-4 border-t border-border pt-8">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-dark-forest">{title}</h2>
      {children}
    </section>
  );
}

export default async function ListingPage(props: PageProps<"/listing/[id]">) {
  const { id } = await props.params;
  const listing = getListingById(id);
  if (!listing) notFound();

  const { d, t, locale, money } = await getI18n();
  const { pricing, owner } = listing;
  const title = listingTitle(listing, locale);

  const facts = [
    { icon: BedDouble, label: d.listing.bedrooms(listing.bedrooms) },
    { icon: Bath, label: d.listing.bathrooms(listing.baths) },
    { icon: Ruler, label: `${listing.sizeSqm} m²` },
    { icon: Users, label: d.listing.upToGuests(listing.maxGuests) },
    { icon: Sofa, label: listing.furnished ? d.listing.furnished : d.listing.unfurnished },
    { icon: CalendarClock, label: d.listing.stayLimits(listing.minStayNights, listing.maxStayMonths) },
  ];

  const rates = [
    { label: d.listing.nightly, hint: d.listing.nightlyHint, value: pricing.nightly, unit: d.listing.unit.night },
    { label: d.listing.weekly, hint: d.listing.weeklyHint, value: pricing.weekly, unit: d.listing.unit.week },
    { label: d.listing.monthly, hint: d.listing.monthlyHint, value: pricing.monthly, unit: d.listing.unit.month, best: true },
  ];

  return (
    <StayDraftProvider listing={listing}>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(listingJsonLd(listing, title.text, listingDescription(listing, locale).text)).replace(/</g, "\\u003c"),
      }}
    />
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-28 sm:px-6 lg:pb-24">
      <div className="flex items-center justify-between gap-4">
        <Link href="/listing" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          {d.listing.allStays}
        </Link>
        <SaveButton listing={listing} variant="labelled" />
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <p className="text-xs font-semibold tracking-wider text-accent-terracotta uppercase">{d.propertyType[listing.type]}</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-dark-forest sm:text-4xl" lang={title.lang}>
          {title.text}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <ListingRating listingId={listing.id} />
          <span className="flex items-center gap-1">
            <MapPin className="size-4" />
            {t(listing.district)}, {t(listing.city)}
          </span>
        </div>
      </div>

      <ListingGallery images={listing.images} title={title.text} />

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-8">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {facts.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 rounded-xl bg-card px-3.5 py-3 text-sm ring-1 ring-border">
                <Icon className="size-4.5 shrink-0 text-primary-sage" />
                {label}
              </li>
            ))}
          </ul>

          <VerificationPanel verification={listing.verification} />

          <OwnerDescription listing={listing} />

          <Section title={d.listing.pricing}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {rates.map((r) => (
                <div
                  key={r.label}
                  className={
                    r.best
                      ? "relative rounded-2xl border-2 border-primary-sage bg-card p-4"
                      : "rounded-2xl border border-border bg-card p-4"
                  }
                >
                  {r.best && (
                    <span className="absolute -top-2.5 left-4 rounded-full bg-primary-sage px-2 py-0.5 text-[11px] font-semibold text-white">
                      {d.listing.bestValue}
                    </span>
                  )}
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.hint}</p>
                  <p className="mt-3">
                    <span className="text-xl font-semibold tabular">{money(r.value)}</span>
                    <span className="text-sm text-muted-foreground"> / {r.unit}</span>
                  </p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-2xl bg-muted/60 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-medium">{d.listing.included}</p>
                <p className="text-muted-foreground">{listing.utilitiesIncluded.map(t).join(", ")}</p>
              </div>
              <div>
                <p className="flex items-center gap-1 font-medium">
                  <Zap className="size-3.5" />
                  {d.listing.electricity}
                </p>
                <p className="text-muted-foreground">{t(listing.electricity)}</p>
              </div>
              <div>
                <p className="font-medium">{d.listing.deposit}</p>
                <p className="text-muted-foreground">{d.listing.depositBody(money(pricing.deposit))}</p>
              </div>
              <div>
                <p className="font-medium">{d.listing.renterFee}</p>
                <p className="text-muted-foreground">{d.listing.renterFeeBody}</p>
              </div>
            </div>
          </Section>

          <Section title={d.listing.availability} id="availability">
            <StayCalendar />
          </Section>

          <Section title={d.listing.offers}>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3">
              {listing.amenities.map((a) => (
                <li key={a} className="flex items-center gap-2.5 text-sm">
                  <AmenityIcon amenity={a} className="size-4.5 shrink-0 text-muted-foreground" />
                  {t(a)}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={d.listing.neighbourhood}>
            <AreaMap location={listing.location} className="aspect-video max-h-80 w-full" />
            <p className="text-sm text-muted-foreground">{d.listing.addressHidden}</p>
            <ul className="flex flex-col gap-2">
              {listing.nearby.map((n) => {
                const [place, distance] = n.split(" · ");
                return (
                  <li key={n} className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-sm ring-1 ring-border">
                    <span className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0 text-primary-sage" />
                      <span lang="en">{place}</span>
                    </span>
                    <span className="shrink-0 text-muted-foreground" lang="en">
                      {distance}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Section>

          <Section title={d.listing.rules}>
            <ul className="flex flex-wrap gap-2">
              {listing.houseRules.map((r) => (
                <li key={r} className="rounded-full bg-muted px-3 py-1.5 text-sm">
                  {t(r)}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={d.reviews.title} id="reviews">
            <ListingReviews listingId={listing.id} ownerFirstName={owner.name.split(" ")[0]} />
          </Section>

          <Section title={d.listing.owner}>
            <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-border sm:flex-row sm:items-center">
              <Avatar className="size-16">
                <AvatarImage src={owner.avatarUrl} alt={owner.name} />
                <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-lg font-semibold">{owner.name}</p>
                <p className="text-sm text-muted-foreground">
                  {owner.identityVerified ? d.listing.identityVerified : d.listing.identityPending} ·{" "}
                  {d.listing.since(owner.joinedYear)}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" />
                    {d.listing.replies(t(owner.responseTime), owner.responseRate)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Languages className="size-4" />
                    {owner.languages.map(t).join(", ")}
                  </span>
                </div>
              </div>
            </div>
          </Section>
        </div>

        <aside id="book" className="scroll-mt-20">
          <BookingSidebar />
        </aside>
      </div>

      <MobileBookingBar />
    </div>
    </StayDraftProvider>
  );
}
