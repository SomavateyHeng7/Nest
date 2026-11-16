import type { Metadata } from "next";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { UsersTable } from "@/features/admin/components/users-table";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.admin.users.title };
}

export default async function AdminUsers() {
  const { d } = await getI18n();
  return (
    <>
      <AdminHeader title={d.admin.users.title} sub={d.admin.users.sub} />
      <UsersTable />
    </>
  );
}
