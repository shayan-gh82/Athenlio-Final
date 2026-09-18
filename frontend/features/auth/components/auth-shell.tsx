"use client";

import { ArrowLeft, ArrowRight, BookOpenCheck, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { BrandLogo } from "@/components/brand/brand-logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

const benefitItems = [
  { icon: BookOpenCheck, key: "panelCourse" },
  { icon: UsersRound, key: "panelTutor" },
  { icon: ShieldCheck, key: "panelSecure" },
] as const;

export function AuthShell({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const t = useTranslations("auth");
  const BackIcon = locale === "fa" ? ArrowRight : ArrowLeft;

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto mb-5 flex max-w-[1180px] items-center justify-between gap-4">
        <Link href={`/${locale}`} aria-label={t("backHome")}><BrandLogo /></Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-[1180px] overflow-hidden rounded-[2rem] border border-white/65 bg-card/90 shadow-[0_30px_90px_rgba(48,42,120,0.14)] backdrop-blur-xl dark:border-white/10 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -start-24 -top-20 size-72 rounded-full bg-secondary-bright/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-28 -end-20 size-80 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <p className="text-sm font-bold text-secondary-bright">{t("panelEyebrow")}</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.35]">{t("panelTitle")}</h1>
            <p className="mt-5 max-w-md leading-8 text-primary-foreground/75">{t("panelDescription")}</p>
          </div>
          <div className="relative grid gap-3">
            {benefitItems.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur">
                <span className="grid size-10 place-items-center rounded-xl bg-white/12"><Icon aria-hidden="true" className="size-5" /></span>
                <span className="text-sm font-semibold">{t(key)}</span>
              </div>
            ))}
          </div>
        </aside>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <div className="w-full max-w-md">
            <Button asChild variant="ghost" size="sm" className="mb-6 -ms-3 rounded-xl text-muted-foreground">
              <Link href={`/${locale}`}><BackIcon aria-hidden="true" />{t("backHome")}</Link>
            </Button>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
