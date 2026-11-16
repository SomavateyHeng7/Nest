import type { Thread } from "@/features/messaging/types";
import { avatarUrl as avatar } from "@/shared/lib/unsplash";

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
