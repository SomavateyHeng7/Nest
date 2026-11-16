import type { Metadata } from "next";
import { Info } from "lucide-react";

import { AdminNav } from "@/components/admin/admin-nav";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: { default: d.admin.eyebrow, template: `%s · ${d.admin.eyebrow}` }, robots: { index: false } };
}

/**
 * Admin console shell. A real build would gate this with auth and call
 * forbidden() for non-staff accounts (see src/app/forbidden.tsx).
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { d } = await getI18n();
  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:gap-10">
      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <AdminNav />
        <p className="mt-6 hidden items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground lg:flex">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          {d.admin.demoNote}
        </p>
      </aside>
      <div className="min-w-0 pb-16">{children}</div>
    </div>
  );
}
