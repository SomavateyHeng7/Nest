export type TripStatus = "upcoming" | "completed" | "cancelled";

export interface Trip {
  id: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: TripStatus;
}

export type ReservationStatus = "upcoming" | "completed";

export interface Reservation {
  id: string;
  listingId: string;
  guestName: string;
  guestAvatarUrl: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  payout: number;
  status: ReservationStatus;
}

export interface MonthlyEarning {
  month: string;
  amount: number;
}
