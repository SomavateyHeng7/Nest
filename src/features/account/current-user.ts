import { avatarUrl as avatar } from "@/shared/lib/unsplash";

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
