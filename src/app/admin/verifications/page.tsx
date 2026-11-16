import type { Metadata } from "next";

import { AdminHeader } from "@/components/admin/admin-header";
import { VerificationQueue } from "@/components/admin/verification-queue";
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
