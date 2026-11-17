import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Landmark } from "lucide-react";

import { PreferencesPanel } from "@/shared/layout/preferences";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { currentUser } from "@/features/account/current-user";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.profile.title };
}

export default async function ProfilePage() {
  const { d } = await getI18n();
  const p = d.profile;
  const checks = (["phone", "email", "identity"] as const).filter((k) => currentUser.verification[k]);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-8 pb-24 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-dark-forest">{p.title}</h1>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex h-fit flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center">
          <Avatar className="size-24">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{p.since(currentUser.joinedYear)}</p>
          </div>
          <ul className="mt-2 flex w-full flex-col gap-2 border-t border-border pt-4 text-left text-sm">
            {checks.map((k) => (
              <li key={k} className="flex items-center gap-2">
                <CircleCheck className="size-4 shrink-0 text-success" />
                {p.verifiedItem(p.checks[k])}
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold">{p.personal}</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">{p.fullName}</span>
                <Input defaultValue={currentUser.name} className="h-10" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">{p.phone}</span>
                <Input defaultValue={currentUser.phone} type="tel" className="h-10" />
              </label>
              <label className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-sm font-medium">{p.email}</span>
                <Input defaultValue={currentUser.email} type="email" className="h-10" />
              </label>
            </div>
            <Button className="mt-5 h-10 bg-accent-terracotta px-4 text-white hover:bg-terracotta-strong">
              {d.common.saveChanges}
            </Button>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold">{p.preferences}</h2>
            <p className="text-sm text-muted-foreground">{p.preferencesSub}</p>
            <PreferencesPanel className="mt-4 max-w-sm" />
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold">{p.payouts}</h2>
            <p className="text-sm text-muted-foreground">{p.payoutsSub}</p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-4 py-3">
              <span className="flex items-center gap-3 text-sm">
                <Landmark className="size-5 text-primary-sage" />
                {currentUser.payoutMethod}
              </span>
              <Button variant="outline" className="h-8 px-3">
                {d.common.change}
              </Button>
            </div>
          </section>

          <Button variant="outline" className="h-10 w-fit px-4" nativeButton={false} render={<Link href="/" />}>
            {d.common.logOut}
          </Button>
        </div>
      </div>
    </div>
  );
}
