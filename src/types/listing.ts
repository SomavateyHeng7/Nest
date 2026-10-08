export type ListingCategory =
  | "apartment"
  | "villa"
  | "guesthouse"
  | "riverside-bungalow"
  | "boutique-hotel";

export interface Host {
  id: string;
  name: string;
  avatarUrl: string;
  joinedYear: number;
  isSuperhost: boolean;
  responseRate: number;
}

export interface Listing {
  id: string;
  title: string;
  city: string;
  province: string;
  category: ListingCategory;
  pricePerNight: number;
  currency: "USD";
  rating: number;
  reviewCount: number;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  description: string;
  amenities: string[];
  images: string[];
  host: Host;
  latitude: number;
  longitude: number;
}
