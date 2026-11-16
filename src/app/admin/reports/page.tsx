import type { Metadata } from "next";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { ReportsTable } from "@/features/admin/components/reports-table";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.admin.reports.title };
}

export default async function AdminReports() {
  const { d } = await getI18n();
  return (
    <>
      <AdminHeader title={d.admin.reports.title} sub={d.admin.reports.sub} />
      <ReportsTable />
    </>
  );
}
