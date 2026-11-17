"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Check, Languages, Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { localeNames, locales } from "@/i18n/config";
import { useI18n, useLocale } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

/** Segmented EN | ខ្មែរ switch. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale, pending } = useLocale();
  const { d } = useI18n();

  return (
    <div
      role="radiogroup"
      aria-label={d.prefs.language}
      className={cn("flex items-center rounded-full bg-muted p-0.5", pending && "opacity-70", className)}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={locale === l}
          lang={l}
          onClick={() => locale !== l && setLocale(l)}
          className={cn(
            "rounded-full px-2.5 py-2 text-xs font-semibold transition-colors sm:py-1",
            locale === l ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {localeNames[l].short}
        </button>
      ))}
    </div>
  );
}

const themes = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
] as const;

/** Light / dark / system theme as a segmented control (used in menus and settings). */
export function ThemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { d } = useI18n();
  const mounted = useMounted();
  const current = mounted ? (theme ?? "system") : null;

  return (
    <div role="radiogroup" aria-label={d.prefs.theme} className={cn("flex rounded-xl bg-muted p-1", className)}>
      {themes.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={current === value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors sm:px-3 sm:py-1.5",
            current === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-4" />
          {d.prefs[value]}
        </button>
      ))}
    </div>
  );
}

/** Navbar button: shows the active theme icon and opens a small light/dark/system menu. */
export function ThemeMenu() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { d } = useI18n();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const Icon = !mounted ? Moon : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={d.prefs.themeMenu}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon className="size-4.5" />
      </Button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-44 rounded-xl border border-border bg-popover p-1 shadow-lg"
        >
          {themes.map(({ value, icon: ItemIcon }) => {
            const active = mounted && (theme ?? "system") === value;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-muted"
              >
                <ItemIcon className="size-4 text-muted-foreground" />
                <span className="flex-1 text-left">{d.prefs[value]}</span>
                {active && <Check className="size-4 text-primary-sage" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Stacked language + theme controls for the mobile menu and the profile page. */
export function PreferencesPanel({ className }: { className?: string }) {
  const { d } = useI18n();
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Languages className="size-3.5" />
          {d.prefs.language}
        </span>
        <LanguageSwitch className="w-fit [&>button]:px-4 [&>button]:py-1.5 [&>button]:text-sm" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-muted-foreground">{d.prefs.theme}</span>
        <ThemeSwitch />
      </div>
    </div>
  );
}
