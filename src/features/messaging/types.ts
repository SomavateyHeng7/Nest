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
