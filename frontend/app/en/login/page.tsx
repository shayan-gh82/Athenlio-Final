import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { privatePageRobots } from "@/lib/seo/site";

export const metadata: Metadata = { title: "Sign in", robots: privatePageRobots };

export default async function EnglishLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LocaleProvider locale="en"><AuthShell><LoginForm returnPath={next} /></AuthShell></LocaleProvider>;
}
