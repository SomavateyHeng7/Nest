import type { Metadata } from "next";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { HostApplications } from "@/features/admin/components/host-applications";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.admin.applications.title };
}

export default async function AdminApplications() {
  const { d } = await getI18n();
  return (
    <>
      <AdminHeader title={d.admin.applications.title} sub={d.admin.applications.sub} />
      <HostApplications />
    </>
  );
}
