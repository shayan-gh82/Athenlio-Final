"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, ExternalLink, GraduationCap, Languages, MapPin, PlayCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CatalogState } from "@/features/catalog/components/catalog-state";
import { getTutorPublicProfile } from "@/features/tutors/api";
import type { TutorProfile } from "@/features/tutors/types";
import { isCatalogAvailable } from "@/lib/api/config";
import { queryKeys } from "@/lib/query/keys";

function tutorName(profile: TutorProfile) {
  return `${profile.user.first_name ?? ""} ${profile.user.last_name ?? ""}`.trim() || profile.user.email;
}

export function TutorDetail({ tutorId }: { tutorId: string }) {
  const locale = useLocale();
  const t = useTranslations("tutorDetail");
  const BackIcon = locale === "fa" ? ArrowRight : ArrowLeft;
  const query = useQuery({
    queryKey: [...queryKeys.tutor(tutorId), locale],
    queryFn: () => getTutorPublicProfile(tutorId, locale),
    enabled: isCatalogAvailable,
    retry: false,
    staleTime: 3 * 60_000,
  });
  const profile = query.data?.profile;
  const courses = query.data?.courses ?? [];
  const name = profile ? tutorName(profile) : "";
  const introVideo = profile?.intro_video_url || profile?.intro_video_file;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Button asChild variant="ghost" className="mb-6 -ms-3 rounded-xl"><Link href={`/${locale}/tutors`}><BackIcon aria-hidden="true" />{t("back")}</Link></Button>
        {!isCatalogAvailable ? <><h1 className="sr-only">{t("pageTitle")}</h1><CatalogState kind="unconfigured" /></> : null}
        {query.isLoading ? <TutorDetailLoading /> : null}
        {query.isError ? <CatalogState kind="error" onRetry={() => query.refetch()} /> : null}
        {profile ? (
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-card/90 p-6 shadow-xl shadow-primary/10 backdrop-blur sm:p-9">
              <div className="absolute -end-24 -top-28 size-80 rounded-full bg-secondary-bright/18 blur-3xl" aria-hidden="true" />
              <div className="absolute -bottom-32 -start-20 size-72 rounded-full bg-primary/12 blur-3xl" aria-hidden="true" />
              <div className="relative flex flex-col gap-7 md:flex-row md:items-center">
                <Avatar className="size-32 rounded-[2rem] ring-4 ring-white/70 shadow-lg sm:size-40"><AvatarImage className="object-cover" src={profile.profile_picture ?? undefined} alt={name} /><AvatarFallback className="rounded-[2rem] bg-primary-soft text-4xl font-black text-primary">{name.slice(0, 1).toUpperCase()}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-bold text-secondary"><Sparkles className="size-4" aria-hidden="true" />{t("eyebrow")}</p>
                  <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{name}</h1>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><MapPin className="size-4" aria-hidden="true" />{profile.country || t("countryUnknown")}</span>
                    <span className="flex items-center gap-2"><Languages className="size-4" aria-hidden="true" />{profile.languages_spoken.map((item) => item.language).join("، ") || t("languagesUnknown")}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">{profile.subjects.map((subject) => <Badge key={subject} variant="secondary">{subject}</Badge>)}</div>
                </div>
                {introVideo ? <Button asChild size="lg" variant="outline" className="h-12 shrink-0 rounded-xl"><a href={introVideo} target="_blank" rel="noreferrer"><PlayCircle aria-hidden="true" />{t("introVideo")}</a></Button> : null}
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                <ProfileSection title={t("about")} icon={Sparkles}><p>{profile.bio || profile.description || t("aboutFallback")}</p></ProfileSection>
                {(profile.teaching_style || profile.expectation) ? <div className="grid gap-5 md:grid-cols-2"><ProfileSection title={t("teachingStyle")} icon={CheckCircle2}><p>{profile.teaching_style || t("notProvided")}</p></ProfileSection><ProfileSection title={t("expectations")} icon={BookOpen}><p>{profile.expectation || t("notProvided")}</p></ProfileSection></div> : null}
                {profile.experiences.length ? <ProfileSection title={t("experience")} icon={BriefcaseBusiness}>{profile.experiences.map((item) => <RecordItem key={item.id} title={item.title} meta={[item.organization, item.city, item.country].filter(Boolean).join(" · ")} description={item.description} />)}</ProfileSection> : null}
                {profile.educations.length ? <ProfileSection title={t("education")} icon={GraduationCap}>{profile.educations.map((item) => <RecordItem key={item.id} title={item.degree} meta={[item.field, item.institution_name, item.country].filter(Boolean).join(" · ")} />)}</ProfileSection> : null}
                {profile.certificates.length ? <ProfileSection title={t("certificates")} icon={CheckCircle2}>{profile.certificates.map((item) => <RecordItem key={item.id} title={item.title} meta={item.issued_by} />)}</ProfileSection> : null}
              </div>

              <Card className="h-fit border-secondary-bright/20 bg-card/92 shadow-lg shadow-primary/8 lg:sticky lg:top-24">
                <CardHeader><p className="text-sm font-bold text-secondary">{t("coursesEyebrow")}</p><CardTitle>{t("coursesTitle")}</CardTitle></CardHeader>
                <CardContent>
                  {courses.length ? <div className="space-y-3">{courses.slice(0, 5).map((course) => <Link key={course.id} href={`/${locale}/courses/${course.id}`} className="group block rounded-2xl border border-border bg-background/55 p-4 transition-colors hover:border-primary/30"><div className="flex items-start justify-between gap-3"><div><p className="font-bold group-hover:text-primary">{course.title}</p><p className="mt-1 text-sm text-muted-foreground">{course.language} · {course.level}</p></div><ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /></div></Link>)}</div> : <div className="rounded-2xl border border-dashed border-border bg-background/40 p-5 text-center"><BookOpen className="mx-auto size-8 text-muted-foreground" aria-hidden="true" /><p className="mt-3 font-bold">{t("noCourses")}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("noCoursesDescription")}</p></div>}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

function ProfileSection({ title, icon: Icon, children }: { title: string; icon: typeof Sparkles; children: React.ReactNode }) {
  return <Card className="border-primary/10 bg-card/88"><CardHeader className="flex-row items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary dark:bg-primary/15"><Icon className="size-5" aria-hidden="true" /></span><CardTitle className="text-xl">{title}</CardTitle></CardHeader><CardContent className="space-y-4 leading-8 text-muted-foreground">{children}</CardContent></Card>;
}

function RecordItem({ title, meta, description }: { title: string; meta?: string; description?: string }) {
  return <div className="border-s-2 border-secondary-bright/35 ps-4"><p className="font-bold text-foreground">{title}</p>{meta ? <p className="text-sm text-muted-foreground">{meta}</p> : null}{description ? <p className="mt-2 text-sm leading-7">{description}</p> : null}</div>;
}

function TutorDetailLoading() {
  return <div className="space-y-6"><Skeleton className="h-72 rounded-[2rem]" /><div className="grid gap-6 lg:grid-cols-[1fr_340px]"><div className="space-y-6"><Skeleton className="h-64 rounded-3xl" /><Skeleton className="h-52 rounded-3xl" /></div><Skeleton className="h-80 rounded-3xl" /></div></div>;
}
