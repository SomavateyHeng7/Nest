import type { Metadata } from "next";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { AuditLog } from "@/features/admin/components/audit-log";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.admin.audit.title };
}

export default async function AdminAudit() {
  const { d } = await getI18n();
  return (
    <>
      <AdminHeader title={d.admin.audit.title} sub={d.admin.audit.sub} />
      <AuditLog />
    </>
  );
}
