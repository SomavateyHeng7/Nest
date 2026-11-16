"use client";

import { useEffect } from "react";
import Link from "next/link";

import { ErrorScreen } from "@/components/errors/error-screen";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

// Error boundaries must be Client Components. Next 16 passes `retry` (re-fetch and re-render).
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { d } = useI18n();
  const e = d.errors;

  useEffect(() => {
    // Hook up an error-reporting service here.
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code={e.server.code}
      tone="danger"
      title={e.server.title}
      body={e.server.body}
      actions={
        <>
          <Button className="h-11 px-5" onClick={() => retry()}>
            {e.retry}
          </Button>
          <Button variant="outline" className="h-11 px-5" nativeButton={false} render={<Link href="/" />}>
            {e.home}
          </Button>
        </>
      }
      footnote={error.digest ? e.reference(error.digest) : undefined}
    />
  );
}
