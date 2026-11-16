import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { d } = await getI18n();
  return { title: d.auth.signup };
}

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
