import type { Metadata } from "next";

import { MaintenanceScreen } from "@/shared/errors/status-screens";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.errors.maintenance.title, robots: { index: false, follow: false } };
}

/** Served by src/proxy.ts (with a 503) while MAINTENANCE_MODE=true. */
export default async function MaintenancePage() {
  const { d } = await getI18n();
  return <MaintenanceScreen d={d} />;
}
