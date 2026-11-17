import Link from "next/link";

import { Logo } from "@/shared/brand/logo";
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
    {
      title: d.footer.company,
      links: [
        { href: "/about", label: d.footer.about },
        { href: "/help", label: d.footer.help },
        { href: "/contact", label: d.footer.contact },
      ],
    },
  ];

  const legalLinks = [
    { href: "/terms", label: d.footer.terms },
    { href: "/privacy", label: d.footer.privacy },
  ];

  return (
    <footer className="mt-auto border-t border-border bg-card/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="col-span-2 flex max-w-xs flex-col gap-3 md:col-span-4 lg:col-span-1">
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
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-8">
          <p className="text-xs text-muted-foreground">{d.footer.legal(new Date().getFullYear())}</p>
          <nav aria-label={`${d.footer.terms} · ${d.footer.privacy}`} className="flex shrink-0 gap-5">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
