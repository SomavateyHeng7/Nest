import type { Metadata } from "next";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { VerificationQueue } from "@/features/admin/components/verification-queue";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.admin.verify.title };
}

export default async function AdminVerifications() {
  const { d } = await getI18n();
  return (
    <>
      <AdminHeader title={d.admin.verify.title} sub={d.admin.verify.sub} />
      <VerificationQueue />
    </>
  );
}
