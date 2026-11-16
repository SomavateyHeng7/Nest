import type { Metadata } from "next";

import { AuthForm } from "@/features/account/components/auth-form";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.auth.login };
}

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
