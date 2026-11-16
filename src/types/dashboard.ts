export type StayStatus = "requested" | "confirmed" | "active" | "completed" | "cancelled";

export interface Stay {
  id: string;
  listingId: string;
  moveIn: string;
  moveOut: string;
  guests: number;
  monthlyRent: number;
  rentTotal: number;
  status: StayStatus;
  nextPaymentDue?: string;
}

export type BookingStatus = "pending" | "confirmed" | "active" | "completed" | "declined";

export interface OwnerBooking {
  id: string;
  listingId: string;
  renterName: string;
  renterAvatarUrl: string;
  renterNote?: string;
  renterVerified: boolean;
  moveIn: string;
  moveOut: string;
  guests: number;
  rentTotal: number;
  firstMonthRent: number;
  status: BookingStatus;
  requestedAt: string;
}

export interface MonthlyIncome {
  /** ISO month, e.g. "2026-06" */
  month: string;
  rent: number;
  fees: number;
}

export interface Message {
  id: string;
  from: "me" | "them";
  body: string;
  sentAt: string;
}

export interface Thread {
  id: string;
  listingId: string;
  withName: string;
  withAvatarUrl: string;
  role: "owner" | "renter";
  unread: number;
  messages: Message[];
}
