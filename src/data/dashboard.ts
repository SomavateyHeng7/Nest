import type { MonthlyEarning, Reservation, Trip } from "@/types/dashboard";

function img(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=200&q=80`;
}

export const currentUser = {
  name: "Sokha Chan",
  email: "sokha@example.com",
  avatarUrl: img("1522771739844-6a9f6d5f14af"),
  joinedYear: 2023,
  isSuperhost: true,
};

// Demo account data — decoupled from each listing's own `host` field, which is
// marketplace flavor text for whoever is browsing that listing.
export const hostListingIds = [
  "riverside-loft-pp",
  "bkk1-serviced-apartment",
  "battambang-heritage-house",
];

export const trips: Trip[] = [
  {
    id: "trip-1",
    listingId: "angkor-pool-villa",
    checkIn: "2026-09-12",
    checkOut: "2026-09-15",
    guests: 4,
    total: 341,
    status: "upcoming",
  },
  {
    id: "trip-2",
    listingId: "siem-reap-boutique-hotel",
    checkIn: "2026-05-02",
    checkOut: "2026-05-05",
    guests: 2,
    total: 152,
    status: "completed",
  },
  {
    id: "trip-3",
    listingId: "kampot-river-bungalow",
    checkIn: "2026-03-10",
    checkOut: "2026-03-12",
    guests: 2,
    total: 94,
    status: "completed",
  },
  {
    id: "trip-4",
    listingId: "kep-crab-market-villa",
    checkIn: "2026-07-01",
    checkOut: "2026-07-04",
    guests: 3,
    total: 197,
    status: "cancelled",
  },
];

export const reservations: Reservation[] = [
  {
    id: "res-1",
    listingId: "riverside-loft-pp",
    guestName: "Emma Chen",
    guestAvatarUrl: img("1522708323590-d24dbb6b0267"),
    checkIn: "2026-08-28",
    checkOut: "2026-09-01",
    guests: 2,
    payout: 168,
    status: "upcoming",
  },
  {
    id: "res-2",
    listingId: "bkk1-serviced-apartment",
    guestName: "Liam Walker",
    guestAvatarUrl: img("1600585154340-be6161a56a0c"),
    checkIn: "2026-09-05",
    checkOut: "2026-09-09",
    guests: 1,
    payout: 140,
    status: "upcoming",
  },
  {
    id: "res-3",
    listingId: "battambang-heritage-house",
    guestName: "Ravi Kumar",
    guestAvatarUrl: img("1568605114967-8130f3a36994"),
    checkIn: "2026-06-14",
    checkOut: "2026-06-17",
    guests: 3,
    payout: 72,
    status: "completed",
  },
  {
    id: "res-4",
    listingId: "riverside-loft-pp",
    guestName: "Nara Sok",
    guestAvatarUrl: img("1571003123894-1f0594d2b5d9"),
    checkIn: "2026-05-20",
    checkOut: "2026-05-23",
    guests: 2,
    payout: 126,
    status: "completed",
  },
];

export const monthlyEarnings: MonthlyEarning[] = [
  { month: "Mar", amount: 320 },
  { month: "Apr", amount: 410 },
  { month: "May", amount: 260 },
  { month: "Jun", amount: 540 },
  { month: "Jul", amount: 610 },
  { month: "Aug", amount: 480 },
];

export function getTotalEarned() {
  return monthlyEarnings.reduce((sum, m) => sum + m.amount, 0);
}

export function getUpcomingPayout() {
  return reservations.filter((r) => r.status === "upcoming").reduce((sum, r) => sum + r.payout, 0);
}
