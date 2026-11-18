import type { Metadata } from "next";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { ReviewModeration } from "@/features/admin/components/review-moderation";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.admin.reviews.title };
}

export default async function AdminReviews() {
  const { d } = await getI18n();
  return (
    <>
      <AdminHeader title={d.admin.reviews.title} sub={d.admin.reviews.sub} />
      <ReviewModeration />
    </>
  );
}
