import type { Metadata } from "next";
import Link from "next/link";
import { Clock, LifeBuoy, Mail, MessageCircle } from "lucide-react";

import { ContactForm } from "@/features/support/components/contact-form";
import { getI18n } from "@/i18n/server";
import { SUPPORT_EMAIL } from "@/shared/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.contact.eyebrow, description: d.contact.lede };
}

export default async function ContactPage() {
  const { d } = await getI18n();
  const c = d.contact;

  const cards = [
    {
      icon: Mail,
      title: c.email,
      body: (
        <a href={`mailto:${SUPPORT_EMAIL}`} className="break-all text-primary-sage underline underline-offset-4 hover:text-foreground">
          {SUPPORT_EMAIL}
        </a>
      ),
    },
    { icon: Clock, title: c.hours, body: c.hoursValue },
    {
      icon: MessageCircle,
      title: c.booked,
      body: (
        <>
          {c.bookedBody}{" "}
          <Link href="/messages" className="text-primary-sage underline underline-offset-4 hover:text-foreground">
            {c.openMessages}
          </Link>
        </>
      ),
    },
    {
      icon: LifeBuoy,
      title: c.helpTitle,
      body: (
        <>
          {c.helpBody}{" "}
          <Link href="/help" className="text-primary-sage underline underline-offset-4 hover:text-foreground">
            {c.openHelp}
          </Link>
        </>
      ),
    },
  ];

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-14 lg:pt-14">
      <div className="flex flex-col gap-8">
        <header>
          <p className="text-sm font-semibold tracking-widest text-accent-terracotta uppercase">{c.eyebrow}</p>
          <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight text-dark-forest sm:text-5xl">{c.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{c.lede}</p>
        </header>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {cards.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3.5 rounded-2xl border border-border bg-card p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{title}</p>
                <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <ContactForm />
    </div>
  );
}
