import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";
import { privatePageRobots } from "@/lib/seo/site";

export const metadata: Metadata = { title: "ثبت‌نام دانشجو", robots: privatePageRobots };

export default async function PersianStudentRegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LocaleProvider locale="fa"><AuthShell><RegisterForm returnPath={next} defaultRole="student" /></AuthShell></LocaleProvider>;
}
