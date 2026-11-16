"use client";

import { Button } from "@/shared/ui/button";

export function RetryButton({ label }: { label: string }) {
  return (
    <Button className="h-11 px-5" onClick={() => window.location.reload()}>
      {label}
    </Button>
  );
}
