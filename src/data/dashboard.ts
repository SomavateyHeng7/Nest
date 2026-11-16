import type { MonthlyIncome, OwnerBooking, Stay, Thread } from "@/types/dashboard";

function avatar(id: string) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=200&q=80`;
}

/** Demo account. One login can rent and list — Nest accounts are both. */
export const currentUser = {
  name: "Sokha Chan",
  firstName: "Sokha",
  email: "sokha@example.com",
  phone: "+855 12 345 678",
  avatarUrl: avatar("1500648767791-00dcc994a43e"),
  joinedYear: 2025,
  verification: { phone: true, email: true, identity: true },
  payoutMethod: "ABA account ending 4821",
};

/** Listings the demo account manages as an owner. */
export const ownerListingIds = ["bkk1-garden-condo", "chroy-changvar-view-condo", "bassac-service-apartment"];

export const ownerListingStatus: Record<string, "live" | "paused" | "in-review"> = {
  "bkk1-garden-condo": "live",
  "chroy-changvar-view-condo": "in-review",
  "bassac-service-apartment": "live",
};

export const stays: Stay[] = [
  {
    id: "stay-1",
    listingId: "siem-reap-wooden-house",
    moveIn: "2026-10-20",
    moveOut: "2026-11-30",
    guests: 2,
    monthlyRent: 780,
    rentTotal: 1066,
    status: "active",
    nextPaymentDue: "2026-11-20",
  },
  {
    id: "stay-2",
    listingId: "toul-kork-family-house",
    moveIn: "2027-01-05",
    moveOut: "2027-07-05",
    guests: 4,
    monthlyRent: 1400,
    rentTotal: 8400,
    status: "confirmed",
  },
  {
    id: "stay-3",
    listingId: "riverside-studio",
    moveIn: "2026-12-06",
    moveOut: "2026-12-13",
    guests: 1,
    monthlyRent: 480,
    rentTotal: 165,
    status: "requested",
  },
  {
    id: "stay-4",
    listingId: "kampot-river-room",
    moveIn: "2026-08-01",
    moveOut: "2026-08-31",
    guests: 1,
    monthlyRent: 260,
    rentTotal: 260,
    status: "completed",
  },
];

export const ownerBookings: OwnerBooking[] = [
  {
    id: "bk-1042",
    listingId: "bkk1-garden-condo",
    renterName: "Emma Laurent",
    renterAvatarUrl: avatar("1544005313-94ddf0286df2"),
    renterNote: "Hi! I'm joining an NGO in BKK1 for a 3-month contract. Is the desk big enough for two monitors?",
    renterVerified: true,
    moveIn: "2026-11-24",
    moveOut: "2027-02-24",
    guests: 1,
    rentTotal: 1950,
    firstMonthRent: 650,
    status: "pending",
    requestedAt: "2026-11-15T09:12:00",
  },
  {
    id: "bk-1041",
    listingId: "bassac-service-apartment",
    renterName: "Rithy Sam",
    renterAvatarUrl: avatar("1534528741775-53994a69daeb"),
    renterNote: "Relocating with my wife from Battambang for work. We'd like to stay 6 months.",
    renterVerified: true,
    moveIn: "2026-12-01",
    moveOut: "2027-06-01",
    guests: 2,
    rentTotal: 6900,
    firstMonthRent: 1150,
    status: "pending",
    requestedAt: "2026-11-14T18:40:00",
  },
  {
    id: "bk-1038",
    listingId: "bkk1-garden-condo",
    renterName: "Kenji Watanabe",
    renterAvatarUrl: avatar("1507003211169-0a1dd7228f2d"),
    renterVerified: true,
    moveIn: "2026-12-20",
    moveOut: "2027-01-04",
    guests: 2,
    rentTotal: 470,
    firstMonthRent: 470,
    status: "confirmed",
    requestedAt: "2026-11-02T11:05:00",
  },
  {
    id: "bk-1031",
    listingId: "bassac-service-apartment",
    renterName: "Chenda Ouk",
    renterAvatarUrl: avatar("1494790108377-be9c29b29330"),
    renterVerified: true,
    moveIn: "2026-08-15",
    moveOut: "2026-11-15",
    guests: 1,
    rentTotal: 3450,
    firstMonthRent: 1150,
    status: "completed",
    requestedAt: "2026-08-01T08:30:00",
  },
  {
    id: "bk-1024",
    listingId: "bkk1-garden-condo",
    renterName: "Lucas Meyer",
    renterAvatarUrl: avatar("1500648767791-00dcc994a43e"),
    renterVerified: true,
    moveIn: "2026-06-01",
    moveOut: "2026-11-01",
    guests: 1,
    rentTotal: 3250,
    firstMonthRent: 650,
    status: "completed",
    requestedAt: "2026-05-20T14:00:00",
  },
];

export const monthlyIncome: MonthlyIncome[] = [
  { month: "2026-06", rent: 650, fees: 488 },
  { month: "2026-07", rent: 650, fees: 0 },
  { month: "2026-08", rent: 1225, fees: 575 },
  { month: "2026-09", rent: 1800, fees: 0 },
  { month: "2026-10", rent: 1800, fees: 0 },
  { month: "2026-11", rent: 1150, fees: 0 },
];

export const threads: Thread[] = [
  {
    id: "t-1",
    listingId: "bkk1-garden-condo",
    withName: "Emma Laurent",
    withAvatarUrl: avatar("1544005313-94ddf0286df2"),
    role: "renter",
    unread: 1,
    messages: [
      { id: "m1", from: "them", body: "Hi Sokha! I just sent a booking request for 3 months from Nov 24.", sentAt: "2026-11-15T09:12:00" },
      { id: "m2", from: "them", body: "Is the desk big enough for two monitors? And is there a backup generator for power cuts?", sentAt: "2026-11-15T09:13:00" },
    ],
  },
  {
    id: "t-2",
    listingId: "siem-reap-wooden-house",
    withName: "Sreymom Ly",
    withAvatarUrl: avatar("1494790108377-be9c29b29330"),
    role: "owner",
    unread: 0,
    messages: [
      { id: "m1", from: "me", body: "Hello! Could I extend my stay by two weeks into December?", sentAt: "2026-11-12T16:20:00" },
      { id: "m2", from: "them", body: "Of course — the house is free until Dec 24. I can send you an extension through Nest.", sentAt: "2026-11-12T17:02:00" },
      { id: "m3", from: "me", body: "Perfect, thank you 🙏", sentAt: "2026-11-12T17:05:00" },
    ],
  },
  {
    id: "t-3",
    listingId: "bassac-service-apartment",
    withName: "Rithy Sam",
    withAvatarUrl: avatar("1534528741775-53994a69daeb"),
    role: "renter",
    unread: 0,
    messages: [
      { id: "m1", from: "them", body: "Sues dey! Is parking included for one car?", sentAt: "2026-11-14T18:41:00" },
      { id: "m2", from: "me", body: "Yes, one basement spot is included with the apartment.", sentAt: "2026-11-14T19:10:00" },
    ],
  },
];
