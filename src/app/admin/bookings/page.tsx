import type { Metadata } from "next";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { BookingsTable } from "@/features/admin/components/bookings-table";
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
