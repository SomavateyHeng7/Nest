import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { getI18n } from "@/i18n/server";

export async function Footer() {
  const { d, t } = await getI18n();

  const columns = [
    {
      title: d.footer.renters,
      links: [
        { href: "/listing", label: d.nav.findStay },
        { href: "/compare", label: d.footer.comparePlaces },
        { href: "/renter", label: d.nav.myStays },
        { href: "/messages", label: d.nav.messages },
      ],
    },
    {
      title: d.footer.owners,
      links: [
        { href: "/owners", label: d.footer.whyList },
        { href: "/host/new", label: d.footer.listProperty },
        { href: "/host", label: d.nav.ownerDashboard },
        { href: "/earning", label: d.footer.income },
      ],
    },
    {
      title: d.footer.cities,
      links: ["Phnom Penh", "Siem Reap", "Kampot"].map((c) => ({
        href: `/listing?city=${encodeURIComponent(c)}`,
        label: t(c),
      })),
    },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-card/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex max-w-xs flex-col gap-3">
          <Logo />
          <p className="text-sm text-muted-foreground">{d.footer.tagline}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-2.5">
            <p className="text-sm font-semibold text-foreground">{col.title}</p>
            {col.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground sm:px-6">{d.footer.legal(new Date().getFullYear())}</p>
      </div>
    </footer>
  );
}
