"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, Building2, KeyRound } from "lucide-react";

import { Logo } from "@/shared/brand/logo";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { listings } from "@/features/listings/data";
import { useI18n } from "@/i18n/client";
import { cn } from "@/shared/lib/utils";

type Role = "renter" | "owner";
type Method = "phone" | "email";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { d } = useI18n();
  const a = d.auth;
  const isLogin = mode === "login";
  const [role, setRole] = useState<Role>("renter");
  const [method, setMethod] = useState<Method>("phone");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    router.push(role === "owner" ? "/host" : "/renter");
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-dark-forest">
          {isLogin ? a.loginTitle : a.signupTitle}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {isLogin ? a.loginSub : a.signupSub}
        </p>

        {!isLogin && (
          <div className="mt-6 grid grid-cols-2 gap-3" role="radiogroup" aria-label={a.iWantTo}>
            {[
              { value: "renter" as const, icon: KeyRound, title: a.renterTitle, body: a.renterBody },
              { value: "owner" as const, icon: Building2, title: a.ownerTitle, body: a.ownerBody },
            ].map(({ value, icon: Icon, title, body }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={role === value}
                onClick={() => setRole(value)}
                className={cn(
                  "flex flex-col gap-2 rounded-2xl border p-4 text-left transition-colors",
                  role === value ? "border-dark-forest bg-accent/50 ring-1 ring-dark-forest" : "border-border bg-card hover:border-foreground/30"
                )}
              >
                <Icon className="size-5 text-primary-sage" />
                <span className="text-sm font-semibold">{title}</span>
                <span className="text-xs text-muted-foreground">{body}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 flex rounded-xl bg-muted p-1" role="tablist">
          {(["phone", "email"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={method === m}
              onClick={() => setMethod(m)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                method === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {m === "phone" ? a.phoneTab : a.emailTab}
            </button>
          ))}
        </div>

        <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{a.fullName}</span>
              <Input name="name" required placeholder={a.namePlaceholder} className="h-11 bg-card" />
            </label>
          )}
          {method === "phone" ? (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{a.phone}</span>
              <div className="flex h-11 items-center rounded-lg border border-input bg-card focus-within:ring-3 focus-within:ring-ring/50">
                <span className="border-r border-input px-3 text-sm text-muted-foreground">🇰🇭 +855</span>
                <input type="tel" required placeholder="12 345 678" className="h-full flex-1 bg-transparent px-3 text-sm outline-none" />
              </div>
              <span className="text-xs text-muted-foreground">{a.phoneHint}</span>
            </label>
          ) : (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">{a.email}</span>
              <Input type="email" required placeholder="you@example.com" className="h-11 bg-card" />
            </label>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between text-sm font-medium">
              {a.password}
              {isLogin && <span className="text-xs font-normal text-muted-foreground underline underline-offset-4">{a.forgot}</span>}
            </span>
            <Input type="password" required placeholder="••••••••" className="h-11 bg-card" />
          </label>

          <Button type="submit" disabled={submitting} className="mt-2 h-12 bg-accent-terracotta text-base text-white hover:bg-terracotta-strong">
            {isLogin ? a.login : a.signup}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{a.prototype}</p>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? a.newHere : a.haveAccount}
          <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-foreground underline underline-offset-4">
            {isLogin ? a.createLink : a.loginLink}
          </Link>
        </p>
      </div>

      <div className="relative hidden min-h-[560px] overflow-hidden rounded-3xl lg:order-first lg:block">
        <Image src={listings[2].images[0]} alt={a.imageAlt} fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-8 bottom-8 text-white">
          <Logo className="[&_span:last-child]:text-white" />
          <p className="mt-4 font-heading text-3xl leading-tight font-semibold">
            {a.sideTitle}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-white/80">
            <BadgeCheck className="size-4" />
            {a.sideNote}
          </p>
        </div>
      </div>
    </div>
  );
}
