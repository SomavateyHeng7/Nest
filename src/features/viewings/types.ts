export type ViewingType = "in-person" | "video";
export type ViewingStatus = "requested" | "confirmed" | "declined";

export interface Viewing {
  id: string;
  listingId: string;
  /** ISO date of the viewing */
  date: string;
  /** 24h time, e.g. "14:00" */
  time: string;
  type: ViewingType;
  note?: string;
  status: ViewingStatus;
}

export interface OwnerViewing extends Viewing {
  renterName: string;
  renterAvatarUrl: string;
}

