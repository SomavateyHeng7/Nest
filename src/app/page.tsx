import Image from "next/image";
import { ShieldCheck, Headset, BadgePercent } from "lucide-react";

import { HeroSearch } from "@/components/listing/hero-search";
import { HomeListings } from "@/components/listing/home-listings";
import { listings } from "@/data/listings";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Verified hosts",
    description: "Every host is identity-checked before their stay goes live.",
  },
  {
    icon: Headset,
    title: "Local support",
    description: "Khmer and English support, seven days a week.",
  },
  {
    icon: BadgePercent,
    title: "Fair pricing",
    description: "No hidden fees — see the full price before you book.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative flex min-h-130 items-center justify-center overflow-hidden px-4 py-20 sm:px-6">
        <Image
          src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=2000&q=80"
          alt="Angkor Wat at sunrise"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-dark-forest/60" />

        <div className="relative flex w-full flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl text-balance font-heading text-4xl font-semibold text-white sm:text-5xl">
            Find your stay across Cambodia
          </h1>
          <p className="max-w-xl text-balance text-white/90">
            Riverside bungalows in Kampot, pool villas near Angkor Wat, and city
            apartments in Phnom Penh — booked in minutes.
          </p>
          <HeroSearch />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        {trustPoints.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-sage/15 text-primary-sage">
              <Icon className="size-5" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </section>

      <HomeListings listings={listings} />
    </div>
  );
}
