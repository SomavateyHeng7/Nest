"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, X } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitch, PreferencesPanel, ThemeMenu } from "@/components/layout/preferences";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { d } = useI18n();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/listing", label: d.nav.findStay },
    { href: "/compare", label: d.nav.compare },
    { href: "/renter", label: d.nav.myStays },
    { href: "/owners", label: d.nav.forOwners },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label={d.nav.home} onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={d.nav.main}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                isActive(link.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitch className="mr-1" />
          <Button
            variant="ghost"
            size="icon"
            aria-label={d.nav.messages}
            className="relative"
            nativeButton={false}
            render={<Link href="/messages" />}
          >
            <MessageCircle className="size-4.5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent-terracotta ring-2 ring-background" />
          </Button>
          <span className="hidden sm:block">
            <ThemeMenu />
          </span>
          <Button
            variant="ghost"
            className="hidden h-9 px-3 xl:inline-flex"
            nativeButton={false}
            render={<Link href="/host" />}
          >
            {d.nav.ownerDashboard}
          </Button>
          <Button className="hidden h-9 px-4 sm:inline-flex" nativeButton={false} render={<Link href="/login" />}>
            {d.nav.logIn}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={open ? d.nav.closeMenu : d.nav.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 pt-2 pb-5 lg:hidden" aria-label={d.nav.mobile}>
          {[...links, { href: "/host", label: d.nav.ownerDashboard }, { href: "/login", label: d.nav.logIn }].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm font-medium",
                isActive(link.href) ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted"
              )}
            >
              {link.label}
            </Link>
          ))}
          <PreferencesPanel className="mt-3 border-t border-border px-3 pt-4" />
        </nav>
      )}
    </header>
  );
}
