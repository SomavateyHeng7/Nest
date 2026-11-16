import type { Metadata } from "next";

import { Inbox } from "@/components/messages/inbox";
import { threads } from "@/data/dashboard";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.messages.title };
}

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Inbox initialThreads={threads} />
    </div>
  );
}
