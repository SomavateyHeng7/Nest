"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, SendHorizontal, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { getListingById } from "@/features/listings/data";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";
import type { Thread } from "@/features/messaging/types";

export function Inbox({ initialThreads }: { initialThreads: Thread[] }) {
  const { d, t, date, lt } = useI18n();
  const m = d.messages;
  const [threads, setThreads] = useState(initialThreads);
  const [activeId, setActiveId] = useState<string | null>(initialThreads[0]?.id ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const active = threads.find((th) => th.id === activeId);
  const listing = active ? getListingById(active.listingId) : undefined;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [activeId, active?.messages.length]);

  function open(id: string) {
    setActiveId(id);
    setMobileOpen(true);
    setThreads((ts) => ts.map((th) => (th.id === id ? { ...th, unread: 0 } : th)));
  }

  function send(body: string) {
    const text = body.trim();
    if (!text || !active) return;
    setThreads((ts) =>
      ts.map((th) =>
        th.id === active.id
          ? { ...th, messages: [...th.messages, { id: crypto.randomUUID(), from: "me", body: text, sentAt: new Date().toISOString() }] }
          : th
      )
    );
    setDraft("");
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card md:h-[calc(100dvh-4rem-3rem)] md:min-h-[520px] md:grid-cols-[320px_minmax(0,1fr)]",
        // Phones: the thread list sizes to its content; an open conversation fills the screen.
        mobileOpen && "h-[calc(100dvh-4rem-3rem)] min-h-[420px]"
      )}
    >
      <aside className={cn("flex flex-col border-r border-border", mobileOpen && "hidden md:flex")}>
        <div className="border-b border-border p-4">
          <h1 className="font-heading text-xl font-semibold text-dark-forest">{m.title}</h1>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {threads.map((thread) => {
            const last = thread.messages[thread.messages.length - 1];
            const l = getListingById(thread.listingId);
            return (
              <li key={thread.id}>
                <button
                  type="button"
                  onClick={() => open(thread.id)}
                  className={cn(
                    "flex w-full gap-3 border-b border-border px-4 py-3.5 text-left transition-colors",
                    thread.id === activeId ? "bg-accent/50" : "hover:bg-muted/60"
                  )}
                >
                  <Avatar size="lg">
                    <AvatarImage src={thread.withAvatarUrl} alt={thread.withName} />
                    <AvatarFallback>{thread.withName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{thread.withName}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{date(last.sentAt, "MMM d")}</span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {thread.role === "owner" ? m.owner : m.renter} · {l ? t(l.district) : ""}
                    </span>
                    <span className={cn("mt-0.5 block truncate text-sm", thread.unread ? "font-medium text-foreground" : "text-muted-foreground")}>
                      {last.from === "me" && m.you}
                      {last.body}
                    </span>
                  </span>
                  {thread.unread > 0 && <span className="mt-1 size-2.5 shrink-0 rounded-full bg-accent-terracotta" aria-label={m.unread} />}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {active && listing ? (
        <section className={cn("flex min-h-0 flex-col", !mobileOpen && "hidden md:flex")}>
          <header className="flex items-center gap-3 border-b border-border p-3 sm:p-4">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={m.back} onClick={() => setMobileOpen(false)}>
              <ChevronLeft className="size-5" />
            </Button>
            <Link href={`/listing/${listing.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-lg">
                <Image src={listing.images[0]} alt="" fill sizes="44px" className="object-cover" />
              </div>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">{active.withName}</span>
                <span className="block truncate text-xs text-muted-foreground" lang={lt(listing).lang}>{lt(listing).text}</span>
              </span>
            </Link>
          </header>

          <div className="flex-1 overflow-y-auto bg-background/50 px-4 py-6">
            <p className="mx-auto mb-6 flex max-w-sm items-start gap-2 rounded-xl bg-muted/70 px-3 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary-sage" />
              {m.safety}
            </p>
            <div className="flex flex-col gap-2">
              {active.messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.from === "me" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm sm:max-w-[65%]",
                      msg.from === "me" ? "rounded-br-md bg-dark-forest text-background" : "rounded-bl-md bg-card ring-1 ring-border"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                    <p className={cn("mt-0.5 text-right text-[10px]", msg.from === "me" ? "opacity-70" : "text-muted-foreground")}>
                      {date(msg.sentAt, "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div ref={endRef} />
          </div>

          <div className="border-t border-border p-3">
            <div className="mb-2 flex gap-2 overflow-x-auto scrollbar-none">
              {m.quick.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              className="flex items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(draft);
              }}
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(draft);
                  }
                }}
                rows={1}
                placeholder={m.placeholder(active.withName.split(" ")[0])}
                aria-label={m.label}
                className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              <Button type="submit" size="icon-lg" className="size-11 rounded-xl bg-accent-terracotta text-white hover:bg-terracotta-strong" aria-label={m.send} disabled={!draft.trim()}>
                <SendHorizontal className="size-4.5" />
              </Button>
            </form>
          </div>
        </section>
      ) : (
        <div className="hidden items-center justify-center text-sm text-muted-foreground md:flex">{m.select}</div>
      )}
    </div>
  );
}
