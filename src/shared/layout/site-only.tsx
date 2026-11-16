"use client";

import { usePathname } from "next/navigation";

/** Renders children everywhere except the admin console, which has its own chrome. */
export function SiteOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ? null : children;
}
