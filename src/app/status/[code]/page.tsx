import type { Metadata } from "next";
import { forbidden, notFound, unauthorized } from "next/navigation";

import { MaintenanceScreen, OfflineScreen } from "@/shared/errors/status-screens";
import { getI18n } from "@/i18n/server";

export const metadata: Metadata = { robots: { index: false } };

/**
 * Triggers each error state the way real code would, so the real boundary /
 * special file renders (with the right HTTP status for 401/403/404).
 */
export default async function StatusPreview(props: PageProps<"/status/[code]">) {
  const { code } = await props.params;
  const { d } = await getI18n();

  switch (code) {
    case "401":
      unauthorized();
    case "403":
      forbidden();
    case "404":
      notFound();
    case "500":
      throw new Error("Preview of the 500 page (thrown on purpose from /status/500)");
    case "503":
      return <MaintenanceScreen d={d} />;
    case "offline":
      return <OfflineScreen d={d} />;
    default:
      notFound();
  }
}
