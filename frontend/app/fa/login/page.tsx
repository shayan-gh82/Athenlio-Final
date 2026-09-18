import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { privatePageRobots } from "@/lib/seo/site";

export const metadata: Metadata = { title: "ورود", robots: privatePageRobots };

export default async function PersianLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LocaleProvider locale="fa"><AuthShell><LoginForm returnPath={next} /></AuthShell></LocaleProvider>;
}
