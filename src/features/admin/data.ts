import { ownerBookings } from "@/features/booking/data";
import type { BookingStatus } from "@/features/booking/types";
import type { PropertyType } from "@/features/listings/types";

function img(id: string, w = 400) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

/** Sample operator data for the admin console. Replace with real queries. */

/** The signed-in staff member (prototype). Every audit entry is stamped with this name. */
export const currentStaff = { name: "Mealea Sok", role: "Trust & safety" };

// ---------- Verification queue ----------------------------------------------

export type DocState = "missing" | "received" | "approved" | "rejected";
export type DocKind = "national-id" | "passport" | "title-deed" | "lease";

/** Metadata for a file in private storage. The file itself is never sent to the browser until staff open it. */
export interface StoredDoc {
  name: string;
  kind: DocKind;
  sizeKb: number;
  uploadedAt: string;
  /** Why staff rejected it; shown to the owner. */
  rejection?: string;
}

/** Days a document stays in storage before it is deleted automatically. */
export const DOC_RETENTION_DAYS = 90;
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
  /** Uploaded files behind `docs`. Absent when nothing was uploaded or the file was deleted. */
  files?: { identity?: StoredDoc; ownership?: StoredDoc };
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
    files: {
      identity: { name: "kosal-national-id.jpg", kind: "national-id", sizeKb: 1840, uploadedAt: "2026-11-15T16:12:00" },
      ownership: { name: "land-title-scan.pdf", kind: "title-deed", sizeKb: 2310, uploadedAt: "2026-11-15T16:18:00" },
    },
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
    files: {
      identity: { name: "passport-page.jpg", kind: "passport", sizeKb: 1210, uploadedAt: "2026-11-14T08:50:00" },
    },
    stage: "docs",
  },
  {
    id: "vq-29",
    title: "Garden studio, BKK1",
    type: "apartment",
    district: "BKK1",
    city: "Phnom Penh",
    ownerName: "Sokha Chan",
    ownerPhone: "+855 12 ••• 678",
    submittedAt: "2026-11-17T10:00:00",
    photos: 6,
    image: img("1493809842364-78817add7ffb"),
    monthly: 520,
    docs: { identity: "approved", ownership: "rejected" },
    files: {
      identity: { name: "national-id.jpg", kind: "national-id", sizeKb: 1520, uploadedAt: "2026-11-17T09:48:00" },
      ownership: { name: "old-title-scan.pdf", kind: "title-deed", sizeKb: 2100, uploadedAt: "2026-11-17T09:55:00", rejection: "Document has expired" },
    },
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
    files: {
      identity: { name: "national-id.jpg", kind: "national-id", sizeKb: 1520, uploadedAt: "2026-11-04T11:20:00" },
      ownership: { name: "hard-title.pdf", kind: "title-deed", sizeKb: 3050, uploadedAt: "2026-11-04T11:31:00" },
    },
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
    files: {
      identity: { name: "id-card.jpg", kind: "national-id", sizeKb: 980, uploadedAt: "2026-11-02T14:02:00" },
      ownership: { name: "lease-agreement.pdf", kind: "lease", sizeKb: 1760, uploadedAt: "2026-11-02T14:09:00" },
    },
    visit: { date: "2026-11-13", time: "15:30", inspector: "Rotha", done: true },
    stage: "ready",
  },
];

// ---------- Host applications -----------------------------------------------

export type ApplicantType = "owner" | "agent" | "manager";
export type ApplicationStatus = "pending" | "info" | "approved" | "rejected";
export type ApplicationFlag = "duplicate-phone" | "agent-no-authority" | "name-mismatch";

export interface HostApplication {
  id: string;
  name: string;
  avatarUrl: string;
  phone: string;
  email?: string;
  appliedAt: string;
  type: ApplicantType;
  city: string;
  /** How many properties they plan to list. */
  properties: number;
  /** What the applicant wrote about themselves. */
  note?: string;
  idType: "national-id" | "passport";
  checks: { phone: boolean; identity: DocState; selfie: DocState; payout: DocState };
  flags: ApplicationFlag[];
  status: ApplicationStatus;
  /** Reason sent to the applicant when info was requested or the application rejected. */
  decisionReason?: string;
  decidedAt?: string;
}

/** People applying to list on Nest. Replace with real queries. */
export const hostApplications: HostApplication[] = [
  {
    id: "ha-52",
    name: "Kosal Prak",
    avatarUrl: img("1534528741775-53994a69daeb", 120),
    phone: "+855 17 ••• 204",
    email: "kosal.p••••@gmail.com",
    appliedAt: "2026-11-16T09:30:00",
    type: "owner",
    city: "Phnom Penh",
    properties: 1,
    note: "I own a studio near Russian Market that I only use on weekends. Looking for monthly tenants.",
    idType: "national-id",
    checks: { phone: true, identity: "received", selfie: "received", payout: "missing" },
    flags: [],
    status: "pending",
  },
  {
    id: "ha-51",
    name: "Chanthou Ros",
    avatarUrl: img("1494790108377-be9c29b29330", 120),
    phone: "+855 98 ••• 415",
    appliedAt: "2026-11-16T07:12:00",
    type: "manager",
    city: "Phnom Penh",
    properties: 6,
    note: "I manage six serviced apartments in BKK1 and Tonle Bassac for an overseas owner.",
    idType: "passport",
    checks: { phone: true, identity: "approved", selfie: "received", payout: "received" },
    flags: ["agent-no-authority"],
    status: "pending",
  },
  {
    id: "ha-50",
    name: "Sophea Kim",
    avatarUrl: img("1438761681033-6461ffad8d80", 120),
    phone: "+855 12 ••• 918",
    email: "sophea.k••••@yahoo.com",
    appliedAt: "2026-11-15T18:45:00",
    type: "owner",
    city: "Siem Reap",
    properties: 2,
    note: "Two wooden houses near Wat Bo. Both are furnished.",
    idType: "national-id",
    checks: { phone: true, identity: "received", selfie: "missing", payout: "missing" },
    flags: ["duplicate-phone"],
    status: "pending",
  },
  {
    id: "ha-49",
    name: "Daniel Reyes",
    avatarUrl: img("1500648767791-00dcc994a43e", 120),
    phone: "+66 81 ••• 2210",
    email: "d.reyes••••@outlook.com",
    appliedAt: "2026-11-14T12:00:00",
    type: "agent",
    city: "Phnom Penh",
    properties: 3,
    note: "Real-estate agent listing condos for several owners.",
    idType: "passport",
    checks: { phone: true, identity: "approved", selfie: "approved", payout: "approved" },
    flags: ["agent-no-authority", "name-mismatch"],
    status: "info",
    decisionReason: "Please upload letters of authority from each owner.",
    decidedAt: "2026-11-14T15:20:00",
  },
  {
    id: "ha-47",
    name: "Vanna Heng",
    avatarUrl: img("1438761681033-6461ffad8d80", 120),
    phone: "+855 70 ••• 119",
    appliedAt: "2026-11-10T10:05:00",
    type: "owner",
    city: "Phnom Penh",
    properties: 3,
    idType: "national-id",
    checks: { phone: true, identity: "approved", selfie: "approved", payout: "approved" },
    flags: [],
    status: "approved",
    decidedAt: "2026-11-11T09:00:00",
  },
  {
    id: "ha-44",
    name: "Rithy Nem",
    avatarUrl: img("1507003211169-0a1dd7228f2d", 120),
    phone: "+855 89 ••• 330",
    appliedAt: "2026-11-06T14:30:00",
    type: "owner",
    city: "Sihanoukville",
    properties: 1,
    idType: "national-id",
    checks: { phone: true, identity: "missing", selfie: "missing", payout: "missing" },
    flags: [],
    status: "rejected",
    decisionReason: "ID could not be read and the applicant did not respond.",
    decidedAt: "2026-11-09T11:10:00",
  },
];

/** An application can only be approved once identity is proven. */
export function canApproveHost(app: HostApplication) {
  return app.checks.phone && app.checks.identity === "approved" && app.checks.selfie === "approved";
}

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

// ---------- Disputes ---------------------------------------------------------

export type DisputeKind = "deposit" | "mismatch" | "cancellation" | "payment";
export type DisputeStatus = "open" | "investigating" | "resolved";
export type DisputeParty = "renter" | "owner";
export type DisputeOutcome = "refund-full" | "refund-partial" | "release-owner" | "dismissed";

/** Nest commits to a first response within this many hours of a dispute being opened. */
export const DISPUTE_SLA_HOURS = 72;

export interface DisputeEvidence {
  id: string;
  from: DisputeParty;
  name: string;
  at: string;
}

export interface DisputeEvent {
  id: string;
  at: string;
  /**
   * "message" came from one of the two people; "request" is staff asking one of
   * them for something; "note" is internal and never shown to either.
   */
  kind: "message" | "request" | "note";
  /** Who wrote it: a renter or owner for messages, a staff member otherwise. */
  by: string;
  /** The person a message came from, or a request was sent to. */
  party?: DisputeParty;
  text: string;
}

export interface Dispute {
  id: string;
  listingId: string;
  kind: DisputeKind;
  status: DisputeStatus;
  openedBy: DisputeParty;
  renter: string;
  owner: string;
  /** Money Nest is holding for this stay, in USD. */
  held: number;
  stay: { moveIn: string; moveOut: string };
  openedAt: string;
  assignee?: string;
  summary: string;
  evidence: DisputeEvidence[];
  timeline: DisputeEvent[];
  resolution?: { outcome: DisputeOutcome; refund: number; note: string; resolvedAt: string; by: string };
}

/** Sample cases. The live list, including ones people open themselves, is in the disputes store. */
export const disputes: Dispute[] = [
  {
    id: "dp-07",
    listingId: "riverside-studio",
    kind: "mismatch",
    status: "investigating",
    openedBy: "renter",
    renter: "Emma Laurent",
    owner: "Sreymom Ly",
    held: 240,
    stay: { moveIn: "2026-11-10", moveOut: "2026-12-10" },
    openedAt: "2026-11-16T10:05:00",
    assignee: "Rithy Ouk",
    summary: "The balcony in photo 2 is shared with the next unit, not private as listed. Renter wants part of the rent back.",
    evidence: [
      { id: "ev-1", from: "renter", name: "balcony-shared.jpg", at: "2026-11-16T10:02:00" },
      { id: "ev-2", from: "renter", name: "listing-screenshot.png", at: "2026-11-16T10:03:00" },
    ],
    timeline: [
      { id: "ev-t1", at: "2026-11-16T10:05:00", kind: "message", by: "Emma Laurent", party: "renter", text: "The listing says private balcony. It is shared with the studio next door and they use it all day." },
      { id: "ev-t2", at: "2026-11-17T09:20:00", kind: "message", by: "Sreymom Ly", party: "owner", text: "The balcony is shared but I wrote 'balcony' only. I am happy to give a small discount." },
      { id: "ev-t3", at: "2026-11-17T09:40:00", kind: "note", by: "Rithy Ouk", text: "Listing photo 2 doesn't show the shared railing. Ask owner to fix the photos regardless of outcome." },
    ],
  },
  {
    id: "dp-06",
    listingId: "toul-kork-family-house",
    kind: "deposit",
    status: "open",
    openedBy: "renter",
    renter: "Kenji Watanabe",
    owner: "Dara Keo",
    held: 1400,
    stay: { moveIn: "2026-09-05", moveOut: "2026-11-05" },
    openedAt: "2026-11-18T08:30:00",
    summary: "Moved out on 5 Nov. Owner hasn’t returned the deposit and mentions damage, but sent no photos.",
    evidence: [
      { id: "ev-3", from: "renter", name: "move-out-video.mp4", at: "2026-11-18T08:25:00" },
      { id: "ev-4", from: "renter", name: "move-in-checklist.pdf", at: "2026-11-18T08:27:00" },
    ],
    timeline: [
      { id: "ev-t4", at: "2026-11-18T08:30:00", kind: "message", by: "Kenji Watanabe", party: "renter", text: "I left the house clean and handed back both keys. It has been two weeks without a reply about the deposit." },
    ],
  },
  {
    id: "dp-05",
    listingId: "siem-reap-wooden-house",
    kind: "cancellation",
    status: "open",
    openedBy: "owner",
    renter: "Rithy Sam",
    owner: "Sreymom Ly",
    held: 780,
    stay: { moveIn: "2026-11-20", moveOut: "2026-12-20" },
    openedAt: "2026-11-15T14:20:00",
    summary: "Renter cancelled the day before move-in and wants the first month back. Owner turned away other guests for those dates.",
    evidence: [{ id: "ev-5", from: "owner", name: "declined-guest-messages.png", at: "2026-11-15T14:18:00" }],
    timeline: [
      { id: "ev-t5", at: "2026-11-15T14:20:00", kind: "message", by: "Sreymom Ly", party: "owner", text: "He cancelled with one day to go. I had two other guests asking for these dates and I said no to both." },
    ],
  },
  {
    id: "dp-04",
    listingId: "bkk1-garden-condo",
    kind: "deposit",
    status: "investigating",
    openedBy: "owner",
    renter: "Marc Dubois",
    owner: "Sokha Chan",
    held: 450,
    stay: { moveIn: "2026-08-15", moveOut: "2026-10-15" },
    openedAt: "2026-11-14T09:40:00",
    assignee: "Rithy Ouk",
    summary: "A glass shelf in the bathroom was broken during the stay. Owner wants it replaced from the deposit.",
    evidence: [{ id: "ev-7", from: "owner", name: "broken-shelf.jpg", at: "2026-11-14T09:35:00" }],
    timeline: [
      { id: "ev-t8", at: "2026-11-14T09:40:00", kind: "message", by: "Sokha Chan", party: "owner", text: "The glass shelf in the bathroom is cracked in two places. A replacement costs about $45." },
      { id: "ev-t9", at: "2026-11-15T10:10:00", kind: "request", by: "Rithy Ouk", party: "renter", text: "Please tell us your side and share any move-out photos." },
    ],
  },
  {
    id: "dp-03",
    listingId: "kampot-river-room",
    kind: "payment",
    status: "resolved",
    openedBy: "owner",
    renter: "Visal Chhun",
    owner: "Vanna Heng",
    held: 260,
    stay: { moveIn: "2026-08-01", moveOut: "2026-08-31" },
    openedAt: "2026-11-09T11:00:00",
    assignee: "Mealea Sok",
    summary: "Renter didn’t arrive and stopped replying after paying.",
    evidence: [{ id: "ev-6", from: "owner", name: "no-show-messages.png", at: "2026-11-09T10:55:00" }],
    timeline: [
      { id: "ev-t6", at: "2026-11-09T11:00:00", kind: "message", by: "Vanna Heng", party: "owner", text: "He paid, then never came and has not answered in five days. The room stayed empty all month." },
      { id: "ev-t7", at: "2026-11-12T15:50:00", kind: "note", by: "Mealea Sok", text: "Renter ignored three messages and one call. Account suspended." },
    ],
    resolution: { outcome: "release-owner", refund: 0, note: "Renter did not respond to three messages and a call.", resolvedAt: "2026-11-12T16:00:00", by: "Mealea Sok" },
  },
];
