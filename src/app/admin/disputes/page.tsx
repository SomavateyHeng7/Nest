import type { Metadata } from "next";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { DisputesBoard } from "@/features/admin/components/disputes-board";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.admin.disputes.title };
}

export default async function AdminDisputes() {
  const { d } = await getI18n();
  return (
    <>
      <AdminHeader title={d.admin.disputes.title} sub={d.admin.disputes.sub} />
      <DisputesBoard />
    </>
  );
}
