"use client";

import { useState } from "react";
import { ChevronDown, CircleCheck, SendHorizontal } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useI18n } from "@/i18n/client";

/**
 * Prototype contact form: validates and confirms, but sends nothing.
 * Swap `handleSubmit` for a server action or API call when support goes live.
 */
export function ContactForm() {
  const { d } = useI18n();
  const c = d.contact;
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    // Simulated round-trip so the button's pending state is visible.
    setTimeout(() => setStatus("sent"), 600);
  }

  if (status === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <span className="grid size-11 place-items-center rounded-full bg-accent text-accent-foreground">
          <CircleCheck className="size-5" />
        </span>
        <h2 className="font-heading text-2xl font-semibold text-dark-forest">{c.sentTitle}</h2>
        <p className="text-muted-foreground">{c.sentBody}</p>
        <Button variant="outline" className="mt-2 h-11 px-4" onClick={() => setStatus("idle")}>
          {c.sendAnother}
        </Button>
      </div>
    );
  }

  const field = "h-11 bg-background";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-5 sm:p-8">
      <h2 className="font-heading text-2xl font-semibold text-dark-forest">{c.formTitle}</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{c.name}</span>
          <Input name="name" required autoComplete="name" className={field} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{c.emailField}</span>
          <Input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={field} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{c.topic}</span>
          <span className="relative">
            <select
              name="topic"
              defaultValue={c.topics[0]}
              className="h-11 w-full appearance-none rounded-lg border border-input bg-background px-2.5 pr-9 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
            >
              {c.topics.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            {c.reference} <span className="font-normal text-muted-foreground">({c.optional})</span>
          </span>
          <Input name="reference" placeholder={c.referencePlaceholder} className={field} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">{c.message}</span>
        <textarea
          name="message"
          required
          rows={6}
          placeholder={c.messagePlaceholder}
          className="min-h-36 w-full resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
        />
      </label>

      <Button
        type="submit"
        disabled={status === "sending"}
        className="h-12 gap-2 self-stretch rounded-xl bg-accent-terracotta px-6 text-base text-white hover:bg-terracotta-strong sm:self-start"
      >
        <SendHorizontal className="size-4" />
        {status === "sending" ? c.sending : c.send}
      </Button>
    </form>
  );
}
