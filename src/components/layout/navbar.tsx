import Link from "next/link";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-dark-forest dark:text-primary-sage">
          <Home className="size-5" />
          <span className="font-heading text-lg font-semibold">Nest Cambodia</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/host" />}>
            Become a host
          </Button>
          <ThemeToggle />
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/login" />}>
            Log in
          </Button>
        </div>
      </div>
    </header>
  );
}
