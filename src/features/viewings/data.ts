import type { OwnerViewing, Viewing } from "@/features/viewings/types";
import { avatarUrl as avatar } from "@/shared/lib/unsplash";

/** Viewings the demo renter already has (new requests are added in the browser). */
export const renterViewings: Viewing[] = [
  { id: "v-101", listingId: "sen-sok-apartment", date: "2026-11-19", time: "10:30", type: "in-person", status: "confirmed" },
];

/** Viewing requests on the demo owner's properties. */
export const ownerViewings: OwnerViewing[] = [
  {
    id: "ov-201",
    listingId: "bkk1-garden-condo",
    renterName: "Malis Chea",
    renterAvatarUrl: avatar("1438761681033-6461ffad8d80"),
    date: "2026-11-18",
    time: "17:30",
    type: "in-person",
    note: "I finish work at 5pm nearby — is 5:30 OK? Moving from Kampong Cham in December.",
    status: "requested",
  },
  {
    id: "ov-202",
    listingId: "bassac-service-apartment",
    renterName: "Daniel Ortiz",
    renterAvatarUrl: avatar("1500648767791-00dcc994a43e"),
    date: "2026-11-19",
    time: "12:00",
    type: "video",
    note: "I'm still in Bangkok — a quick video walk-through would be great.",
    status: "requested",
  },
];

/** Times owners offer viewings by default. */
export const viewingTimes = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:30"];

