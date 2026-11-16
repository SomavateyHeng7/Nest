"use client";

import { useEffect, useState } from "react";

import "./globals.css";
import { ErrorScreen } from "@/components/errors/error-screen";
import { dictionaries } from "@/i18n";
import { LOCALE_COOKIE, isLocale, type Locale } from "@/i18n/config";

/**
 * Last-resort boundary for errors in the root layout itself. It replaces the
 * whole document, so it can't use the app's providers: it reads the language
 * cookie and theme preference directly.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    console.error(error);
    const cookie = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`))?.[1];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser-only preferences after mount
    if (isLocale(cookie)) setLocale(cookie);
    let theme: string | null = null;
    try {
      theme = localStorage.getItem("theme");
    } catch {}
    setDark(theme === "dark" || ((!theme || theme === "system") && matchMedia("(prefers-color-scheme: dark)").matches));
  }, [error]);

  const e = dictionaries[locale].errors;

  return (
    <html lang={locale} className={dark ? "dark" : undefined}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <title>{e.server.title}</title>
        <ErrorScreen
          code={e.server.code}
          tone="danger"
          title={e.server.title}
          body={e.server.body}
          actions={
            <>
              <button
                type="button"
                onClick={() => retry()}
                className="h-11 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/85"
              >
                {e.retry}
              </button>
              {/* Plain <a> on purpose: a full reload is the safe way home when the app itself failed. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-medium hover:bg-muted">
                {e.home}
              </a>
            </>
          }
          footnote={error.digest ? e.reference(error.digest) : undefined}
        />
      </body>
    </html>
  );
}
