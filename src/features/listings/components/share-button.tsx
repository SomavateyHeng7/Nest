"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Link2, Send, Share2 } from "lucide-react";

import { toast } from "@/shared/ui/toast";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

/**
 * Share a page. Phones with a native share sheet get that; everywhere else
 * shows Telegram, WhatsApp and Line links plus copy-link, the apps people in
 * Cambodia actually use.
 */
export function ShareButton({ path, title, className }: { path: string; title: string; className?: string }) {
  const { d } = useI18n();
  const s = d.share;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // Close on Escape or a click elsewhere.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => root.current && !root.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const url = () => new URL(path, window.location.origin).toString();

  async function onShare() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: url() });
        return;
      } catch (err) {
        if ((err as DOMException).name === "AbortError") return;
      }
    }
    setOpen((o) => !o);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      toast.success(s.copied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(s.copyFailed);
    }
  }

  const links = (): { label: string; href: string }[] => {
    const u = encodeURIComponent(url());
    const text = encodeURIComponent(title);
    return [
      { label: "Telegram", href: `https://t.me/share/url?url=${u}&text=${text}` },
      { label: "WhatsApp", href: `https://wa.me/?text=${text}%20${u}` },
      { label: "Line", href: `https://line.me/R/msg/text/?${text}%20${u}` },
    ];
  };

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        onClick={onShare}
        aria-expanded={open}
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-sm font-medium transition-colors hover:border-foreground/30"
      >
        <Share2 className="size-4" aria-hidden />
        {s.share}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-2 flex w-48 flex-col rounded-2xl border border-border bg-popover p-1.5 shadow-xl shadow-black/10">
          {links().map((l) => (
            <a
              key={l.label}
              role="menuitem"
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted"
            >
              <Send className="size-4 text-muted-foreground" aria-hidden />
              {l.label}
            </a>
          ))}
          <button type="button" role="menuitem" onClick={copy} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted">
            {copied ? <Check className="size-4 text-success" aria-hidden /> : <Link2 className="size-4 text-muted-foreground" aria-hidden />}
            {s.copyLink}
          </button>
        </div>
      )}
    </div>
  );
}
