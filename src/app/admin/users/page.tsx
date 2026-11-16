import type { Metadata } from "next";

import { AdminHeader } from "@/components/admin/admin-header";
import { UsersTable } from "@/components/admin/users-table";
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
