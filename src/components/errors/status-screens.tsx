import Link from "next/link";

import { ErrorScreen } from "@/components/errors/error-screen";
import { RetryButton } from "@/components/errors/retry-button";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n";

/** 503 — planned maintenance. Render from a maintenance flag or proxy rewrite. */
export function MaintenanceScreen({ d }: { d: Dictionary }) {
  const e = d.errors;
  return (
    <ErrorScreen
      code={e.maintenance.code}
      tone="warning"
      title={e.maintenance.title}
      body={e.maintenance.body}
      actions={<RetryButton label={e.retry} />}
      footnote={e.maintenance.footnote}
    />
  );
}

/** Shown when the browser is offline and a page can't load. */
export function OfflineScreen({ d }: { d: Dictionary }) {
  const e = d.errors;
  return (
    <ErrorScreen
      title={e.offline.title}
      body={e.offline.body}
      actions={
        <>
          <RetryButton label={e.retry} />
          <Button variant="outline" className="h-11 px-5" nativeButton={false} render={<Link href="/renter" />}>
            {e.offline.saved}
          </Button>
        </>
      }
    />
  );
}
