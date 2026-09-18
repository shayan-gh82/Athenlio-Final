"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  GraduationCap,
  Languages,
  Search,
  Sparkles,
  UserRoundSearch,
} from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { SiteFooter } from "@/components/layout/site-footer";
import { HomeCatalogs } from "./home-catalogs";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const journeyIcons = [Search, Compass, CheckCircle2];

export function HomeExperience() {
  const locale = useLocale();
  const t = useTranslations("home");
  const Arrow = locale === "fa" ? ArrowLeft : ArrowRight;
  const localeRoot = `/${locale}`;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SiteHeader />

      <main>
        <section id="home" className="relative isolate scroll-mt-24 overflow-hidden">
          <div className="hero-orb hero-orb-primary" aria-hidden="true" />
          <div className="hero-orb hero-orb-secondary" aria-hidden="true" />
          <div className="mx-auto grid min-h-[690px] max-w-[1280px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8 lg:py-24">
            <div className="relative z-10 max-w-2xl">
              <Badge variant="outline" className="mb-6 border-primary/20 bg-primary-soft px-3 py-1.5 text-primary">
                <Sparkles aria-hidden="true" />
                {t("eyebrow")}
              </Badge>
              <h1 className="text-balance text-[clamp(2.55rem,6vw,4.65rem)] font-bold leading-[1.13] tracking-[-0.045em]">
                {t("titleStart")} <span className="text-gradient">{t("titleHighlight")}</span> {t("titleEnd")}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl sm:leading-9">
                {t("description")}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base shadow-md shadow-primary/15">
                  <Link href={`${localeRoot}/courses`}>
                    <BookOpen aria-hidden="true" />
                    {t("browseCourses")}
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-primary/20 bg-card/70 px-6 text-base backdrop-blur">
                  <Link href={`${localeRoot}/tutors`}>
                    <UserRoundSearch aria-hidden="true" />
                    {t("findTutor")}
                  </Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-3 text-sm leading-6 text-muted-foreground">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary-bright/15 text-secondary">
                  <Languages aria-hidden="true" className="size-5" />
                </span>
                {t("trustCue")}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[560px]">
              <div className="hero-panel relative overflow-hidden rounded-[2rem] border border-white/60 bg-card/80 p-5 shadow-[0_32px_80px_rgba(48,42,120,0.16)] backdrop-blur-xl dark:border-white/10 sm:p-7">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-secondary">{t("visualKicker")}</p>
                    <h2 className="mt-1 text-2xl font-bold">{t("visualTitle")}</h2>
                  </div>
                  <span className="grid size-12 place-items-center rounded-2xl bg-accent/20 text-warning">
                    <Sparkles aria-hidden="true" />
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="group rounded-2xl border border-primary/15 bg-primary-soft p-5 transition-transform duration-300 hover:-translate-y-1 dark:bg-primary/10">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                      <GraduationCap aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-lg font-bold">{t("coursePathTitle")}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("coursePathText")}</p>
                  </div>
                  <div className="group rounded-2xl border border-secondary-bright/25 bg-secondary-bright/10 p-5 transition-transform duration-300 hover:-translate-y-1">
                    <span className="grid size-11 place-items-center rounded-xl bg-secondary text-white shadow-sm">
                      <UserRoundSearch aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-lg font-bold">{t("tutorPathTitle")}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("tutorPathText")}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-4">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-primary to-secondary-bright" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{t("progressLabel")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HomeCatalogs />
        <section className="border-y border-border/70 bg-card/55 py-20" aria-labelledby="choose-path-title">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold text-secondary">{t("pathsEyebrow")}</p>
              <h2 id="choose-path-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t("pathsTitle")}</h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">{t("pathsDescription")}</p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <Card id="courses" className="scroll-mt-28 overflow-hidden border-primary/15 bg-background/90 py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                <CardHeader className="border-b border-primary/10 bg-primary-soft p-7 dark:bg-primary/10">
                  <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                    <BookOpen aria-hidden="true" />
                  </span>
                  <CardTitle className="text-2xl">{t("coursesTitle")}</CardTitle>
                  <CardDescription className="text-base leading-8">{t("coursesDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="p-7">
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    {["coursesFeatureOne", "coursesFeatureTwo", "coursesFeatureThree"].map((key) => (
                      <li key={key} className="flex items-start gap-3">
                        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-secondary" />
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="link" className="mt-5 h-auto p-0 text-base font-bold">
                    <Link href={`${localeRoot}/courses`}>{t("exploreCourses")} <Arrow aria-hidden="true" /></Link>
                  </Button>
                </CardContent>
              </Card>

              <Card id="tutors" className="scroll-mt-28 overflow-hidden border-secondary-bright/20 bg-background/90 py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary-bright/10">
                <CardHeader className="border-b border-secondary-bright/15 bg-secondary-bright/10 p-7">
                  <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-secondary text-white">
                    <UserRoundSearch aria-hidden="true" />
                  </span>
                  <CardTitle className="text-2xl">{t("tutorsTitle")}</CardTitle>
                  <CardDescription className="text-base leading-8">{t("tutorsDescription")}</CardDescription>
                </CardHeader>
                <CardContent className="p-7">
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    {["tutorsFeatureOne", "tutorsFeatureTwo", "tutorsFeatureThree"].map((key) => (
                      <li key={key} className="flex items-start gap-3">
                        <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-secondary" />
                        {t(key)}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="link" className="mt-5 h-auto p-0 text-base font-bold">
                    <Link href={`${localeRoot}/tutors`}>{t("exploreTutors")} <Arrow aria-hidden="true" /></Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="journey" className="scroll-mt-24 py-20 sm:py-24" aria-labelledby="journey-title">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold text-secondary">{t("journeyEyebrow")}</p>
              <h2 id="journey-title" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t("journeyTitle")}</h2>
            </div>
            <ol className="mt-12 grid gap-5 md:grid-cols-3">
              {journeyIcons.map((Icon, index) => (
                <li key={index} className="relative rounded-3xl border border-border bg-card p-7 shadow-sm">
                  <span className="absolute top-5 end-5 text-5xl font-black text-primary/7">0{index + 1}</span>
                  <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary dark:bg-primary/15">
                    <Icon aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold">{t(`journeyStep${index + 1}Title`)}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(`journeyStep${index + 1}Text`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
          <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground shadow-2xl shadow-primary/20 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14">
            <div className="absolute -top-24 -end-20 size-72 rounded-full bg-secondary-bright/25 blur-3xl" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <p className="text-sm font-bold text-secondary-bright">{t("ctaEyebrow")}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t("ctaTitle")}</h2>
              <p className="mt-4 leading-8 text-primary-foreground/75">{t("ctaDescription")}</p>
            </div>
            <Button asChild size="lg" variant="secondary" className="relative mt-8 h-12 rounded-xl bg-white px-6 text-primary hover:bg-white/90 lg:mt-0">
              <Link href={`${localeRoot}/register`}>{t("ctaButton")} <Arrow aria-hidden="true" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
