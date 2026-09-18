import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";
import { privatePageRobots } from "@/lib/seo/site";

export const metadata: Metadata = { title: "Student registration", robots: privatePageRobots };

export default async function EnglishStudentRegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return <LocaleProvider locale="en"><AuthShell><RegisterForm returnPath={next} defaultRole="student" /></AuthShell></LocaleProvider>;
}
