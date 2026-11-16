import { ownerBookings } from "@/data/dashboard";
import type { BookingStatus } from "@/types/dashboard";
import type { PropertyType } from "@/types/listing";

function img(id: string, w = 400) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

/** Sample operator data for the admin console. Replace with real queries. */

// ---------- Verification queue ----------------------------------------------

export type DocState = "missing" | "received" | "approved";
export type VerificationStage = "docs" | "visit" | "ready";

export interface VerificationItem {
  id: string;
  listingId?: string;
  title: string;
  type: PropertyType;
  district: string;
  city: string;
  ownerName: string;
  ownerPhone: string;
  submittedAt: string;
  photos: number;
  image: string;
  monthly: number;
  docs: { identity: DocState; ownership: DocState };
  visit?: { date: string; time: string; inspector: string; done?: boolean };
  stage: VerificationStage;
}

export const inspectors = ["Bopha", "Rotha", "Piseth"];

export const verificationQueue: VerificationItem[] = [
  {
    id: "vq-31",
    title: "Studio near Russian Market",
    type: "apartment",
    district: "Toul Tom Poung",
    city: "Phnom Penh",
    ownerName: "Kosal Prak",
    ownerPhone: "+855 17 ••• 204",
    submittedAt: "2026-11-15T16:20:00",
    photos: 7,
    image: img("1493809842364-78817add7ffb"),
    monthly: 390,
    docs: { identity: "received", ownership: "received" },
    stage: "docs",
  },
  {
    id: "vq-30",
    title: "Room in shared villa, BKK3",
    type: "room",
    district: "BKK3",
    city: "Phnom Penh",
    ownerName: "Linda Meas",
    ownerPhone: "+855 12 ••• 918",
    submittedAt: "2026-11-14T09:05:00",
    photos: 5,
    image: img("1505691938895-1758d7feb511"),
    monthly: 240,
    docs: { identity: "approved", ownership: "missing" },
    stage: "docs",
  },
  {
    id: "vq-28",
    listingId: "chroy-changvar-view-condo",
    title: "High-floor condo with Mekong views",
    type: "condo",
    district: "Chroy Changvar",
    city: "Phnom Penh",
    ownerName: "Sokha Chan",
    ownerPhone: "+855 12 ••• 678",
    submittedAt: "2026-11-04T11:40:00",
    photos: 9,
    image: img("1512917774080-9991f1c4c750"),
    monthly: 720,
    docs: { identity: "approved", ownership: "approved" },
    visit: { date: "2026-11-18", time: "10:00", inspector: "Bopha" },
    stage: "visit",
  },
  {
    id: "vq-26",
    title: "2-bed townhouse, Sen Sok",
    type: "house",
    district: "Sen Sok",
    city: "Phnom Penh",
    ownerName: "Vibol Tan",
    ownerPhone: "+855 96 ••• 551",
    submittedAt: "2026-11-02T14:15:00",
    photos: 11,
    image: img("1600607687939-ce8a6c25118c"),
    monthly: 610,
    docs: { identity: "approved", ownership: "approved" },
    visit: { date: "2026-11-13", time: "15:30", inspector: "Rotha", done: true },
    stage: "ready",
  },
];

// ---------- Users ------------------------------------------------------------

export type UserRole = "owner" | "renter";
export type UserStatus = "active" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  phone: string;
  joined: string;
  phoneVerified: boolean;
  idVerified: boolean;
  /** Listings for owners, stays for renters. */
  count: number;
  status: UserStatus;
  lastActive: string;
}

export const adminUsers: AdminUser[] = [
  { id: "u-1", name: "Sokha Chan", role: "owner", avatarUrl: img("1500648767791-00dcc994a43e", 120), phone: "+855 12 ••• 678", joined: "2025-03-02", phoneVerified: true, idVerified: true, count: 3, status: "active", lastActive: "2026-11-16T08:10:00" },
  { id: "u-2", name: "Dara Keo", role: "owner", avatarUrl: img("1507003211169-0a1dd7228f2d", 120), phone: "+855 11 ••• 302", joined: "2025-05-19", phoneVerified: true, idVerified: true, count: 2, status: "active", lastActive: "2026-11-15T19:44:00" },
  { id: "u-3", name: "Sreymom Ly", role: "owner", avatarUrl: img("1494790108377-be9c29b29330", 120), phone: "+855 15 ••• 740", joined: "2026-01-08", phoneVerified: true, idVerified: true, count: 2, status: "active", lastActive: "2026-11-12T17:05:00" },
  { id: "u-4", name: "Vanna Heng", role: "owner", avatarUrl: img("1438761681033-6461ffad8d80", 120), phone: "+855 70 ••• 119", joined: "2026-02-21", phoneVerified: true, idVerified: true, count: 3, status: "active", lastActive: "2026-11-14T10:30:00" },
  { id: "u-5", name: "Kosal Prak", role: "owner", avatarUrl: img("1534528741775-53994a69daeb", 120), phone: "+855 17 ••• 204", joined: "2026-11-15", phoneVerified: true, idVerified: false, count: 0, status: "active", lastActive: "2026-11-15T16:20:00" },
  { id: "u-6", name: "Linda Meas", role: "owner", avatarUrl: img("1544005313-94ddf0286df2", 120), phone: "+855 12 ••• 918", joined: "2026-11-13", phoneVerified: true, idVerified: true, count: 0, status: "active", lastActive: "2026-11-14T09:05:00" },
  { id: "u-7", name: "Emma Laurent", role: "renter", avatarUrl: img("1544005313-94ddf0286df2", 120), phone: "+33 6 •• •• 41", joined: "2026-11-10", phoneVerified: true, idVerified: true, count: 1, status: "active", lastActive: "2026-11-15T09:12:00" },
  { id: "u-8", name: "Rithy Sam", role: "renter", avatarUrl: img("1534528741775-53994a69daeb", 120), phone: "+855 89 ••• 027", joined: "2026-10-28", phoneVerified: true, idVerified: true, count: 1, status: "active", lastActive: "2026-11-14T18:41:00" },
  { id: "u-9", name: "Kenji Watanabe", role: "renter", avatarUrl: img("1507003211169-0a1dd7228f2d", 120), phone: "+81 90 •••• 3310", joined: "2026-10-30", phoneVerified: true, idVerified: true, count: 1, status: "active", lastActive: "2026-11-02T11:05:00" },
  { id: "u-10", name: "Malis Chea", role: "renter", avatarUrl: img("1438761681033-6461ffad8d80", 120), phone: "+855 16 ••• 885", joined: "2026-11-11", phoneVerified: true, idVerified: false, count: 0, status: "active", lastActive: "2026-11-16T07:55:00" },
  { id: "u-11", name: "Daniel Ortiz", role: "renter", avatarUrl: img("1500648767791-00dcc994a43e", 120), phone: "+66 81 ••• 4470", joined: "2026-11-12", phoneVerified: true, idVerified: false, count: 0, status: "active", lastActive: "2026-11-14T22:18:00" },
  { id: "u-12", name: "Visal Chhun", role: "renter", avatarUrl: img("1507003211169-0a1dd7228f2d", 120), phone: "+855 97 ••• 662", joined: "2026-09-04", phoneVerified: true, idVerified: true, count: 2, status: "suspended", lastActive: "2026-10-21T13:00:00" },
];

// ---------- Reports (trust & safety) ----------------------------------------

export type ReportSeverity = "high" | "medium" | "low";
export type ReportKind = "off-platform" | "mismatch" | "no-reply";

export interface Report {
  id: string;
  kind: ReportKind;
  severity: ReportSeverity;
  reporter: string;
  subject: string;
  listingId?: string;
  message: string;
  createdAt: string;
}

export const reports: Report[] = [
  {
    id: "rp-14",
    kind: "off-platform",
    severity: "high",
    reporter: "Daniel Ortiz",
    subject: "Linda Meas",
    message: "The owner asked me to send the deposit by ABA directly before the viewing, outside Nest.",
    createdAt: "2026-11-15T21:30:00",
  },
  {
    id: "rp-13",
    kind: "mismatch",
    severity: "medium",
    reporter: "Emma Laurent",
    subject: "Riverside studio near the Royal Palace",
    listingId: "riverside-studio",
    message: "Second photo shows a balcony, but the owner says it's shared and not part of the unit.",
    createdAt: "2026-11-14T13:02:00",
  },
  {
    id: "rp-11",
    kind: "no-reply",
    severity: "low",
    reporter: "Malis Chea",
    subject: "Dara Keo",
    message: "Sent a question about parking three days ago, no reply yet.",
    createdAt: "2026-11-12T08:45:00",
  },
];

// ---------- Bookings ----------------------------------------------------------

export interface AdminBooking {
  id: string;
  listingId: string;
  renterName: string;
  moveIn: string;
  moveOut: string;
  rentTotal: number;
  firstMonthRent: number;
  status: BookingStatus;
  requestedAt: string;
}

export const adminBookings: AdminBooking[] = [
  ...ownerBookings.map(({ id, listingId, renterName, moveIn, moveOut, rentTotal, firstMonthRent, status, requestedAt }) => ({
    id,
    listingId,
    renterName,
    moveIn,
    moveOut,
    rentTotal,
    firstMonthRent,
    status,
    requestedAt,
  })),
  { id: "bk-1044", listingId: "toul-kork-student-room", renterName: "Sophea Nhem", moveIn: "2026-12-01", moveOut: "2027-04-01", rentTotal: 760, firstMonthRent: 190, status: "pending", requestedAt: "2026-11-13T07:20:00" },
  { id: "bk-1043", listingId: "siem-reap-wooden-house", renterName: "Anna Kowalski", moveIn: "2026-12-26", moveOut: "2027-01-02", rentTotal: 280, firstMonthRent: 280, status: "declined", requestedAt: "2026-11-11T15:00:00" },
  { id: "bk-1040", listingId: "toul-kork-family-house", renterName: "Sokha Chan", moveIn: "2027-01-05", moveOut: "2027-07-05", rentTotal: 8400, firstMonthRent: 1400, status: "confirmed", requestedAt: "2026-11-01T10:00:00" },
  { id: "bk-1035", listingId: "siem-reap-wooden-house", renterName: "Sokha Chan", moveIn: "2026-10-20", moveOut: "2026-11-30", rentTotal: 1066, firstMonthRent: 780, status: "active", requestedAt: "2026-10-05T12:30:00" },
];

// ---------- Metrics (last 30 days, sample) -----------------------------------

export const funnel = [
  { key: "searches", value: 4820 },
  { key: "views", value: 2140 },
  { key: "requests", value: 186 },
  { key: "accepted", value: 74 },
  { key: "paid", value: 61 },
] as const;

/** Paid bookings by stay length — the mix that drives placement-fee revenue. */
export const stayMix = [
  { key: "under1", value: 9 },
  { key: "m1to3", value: 31 },
  { key: "m4to6", value: 15 },
  { key: "m7to12", value: 6 },
] as const;

export const platformKpis = {
  feeRevenue: 3860,
  feeRevenuePrev: 2910,
  bookedRent: 41200,
  liveListings: 9,
  medianReplyHours: 3.4,
};
