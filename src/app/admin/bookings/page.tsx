import type { Metadata } from "next";

import { AdminHeader } from "@/components/admin/admin-header";
import { BookingsTable } from "@/components/admin/bookings-table";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.admin.bookings.title };
}

export default async function AdminBookings() {
  const { d } = await getI18n();
  return (
    <>
      <AdminHeader title={d.admin.bookings.title} sub={d.admin.bookings.sub} />
      <BookingsTable />
    </>
  );
}
