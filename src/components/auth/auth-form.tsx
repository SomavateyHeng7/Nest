"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === "login";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    router.push("/");
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{isLogin ? "Log in" : "Create your account"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Welcome back — log in to manage your bookings."
              : "Sign up to start booking stays across Cambodia."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full name
                </label>
                <Input id="name" name="name" type="text" required placeholder="Sokha Chan" />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Input id="password" name="password" type="password" required placeholder="••••••••" />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="mt-2 bg-accent-terracotta text-white hover:bg-accent-terracotta/90"
            >
              {isLogin ? "Log in" : "Sign up"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Demo only — this isn&apos;t connected to a real account system yet.
            </p>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary-sage underline underline-offset-4">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href="/login" className="text-primary-sage underline underline-offset-4">
                  Log in
                </Link>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
