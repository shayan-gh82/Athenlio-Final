"use client";

import { AlertCircle, BookCheck, BookOpen, CheckCircle2, Clock3, Heart, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentDashboard } from "@/features/students/api";
import { LearningRecords } from "./learning-records";
import { enrollmentStatusPresentation } from "@/features/enrollments/types";
import { isApiConfigured } from "@/lib/api/config";
import { queryKeys } from "@/lib/query/keys";
import { useAppSelector } from "@/store/hooks";

const statIcons = [BookCheck, Clock3, Heart, CheckCircle2] as const;

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)}</div>
      <div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-80 rounded-3xl" /><Skeleton className="h-80 rounded-3xl" /></div>
    </div>
  );
}

export function StudentDashboard() {
  const locale = useLocale();
  const t = useTranslations("studentDashboard");
  const statusT = useTranslations("enrollmentStatus");
  const router = useRouter();
  const authStatus = useAppSelector((state) => state.auth.status);
  const user = useAppSelector((state) => state.auth.user);
  const query = useQuery({
    queryKey: queryKeys.studentDashboard,
    queryFn: getStudentDashboard,
    enabled: isApiConfigured && authStatus === "student",
    retry: false,
    staleTime: 45_000,
  });

  useEffect(() => {
    if (!isApiConfigured || authStatus === "unknown" || authStatus === "student") return;
    router.replace(authStatus === "guest" ? `/${locale}/login` : `/${locale}`);
  }, [authStatus, locale, router]);

  const data = query.data;
  const statValues = data ? [
    data.approved_courses.length,
    data.enrollments.filter((item) => item.status === "under_review").length,
    data.student.favourite_tutors.length,
    data.student.student_homework_completed.length,
  ] : [null, null, null, null];
  const statKeys = ["activeCourses", "underReview", "favoriteTutors", "completedHomework"] as const;

  return (
    <DashboardShell title={t("pageTitle")}>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1400px]">
          <section className="relative mb-6 overflow-hidden rounded-3xl bg-primary px-6 py-7 text-primary-foreground shadow-lg shadow-primary/15 sm:px-8">
            <div className="absolute -end-14 -top-20 size-60 rounded-full bg-secondary-bright/25 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-secondary-bright"><Sparkles className="size-4" />{t("eyebrow")}</p>
                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{t("welcome", { name: user?.first_name || t("student") })}</h2>
                <p className="mt-2 max-w-2xl leading-7 text-primary-foreground/75">{t("welcomeDescription")}</p>
              </div>
              <Button asChild variant="secondary" className="h-11 shrink-0 rounded-xl bg-white text-primary hover:bg-white/90">
                <Link href={`/${locale}/courses`}><Search aria-hidden="true" />{t("findCourse")}</Link>
              </Button>
            </div>
          </section>

          {!isApiConfigured ? (
            <Alert className="mb-6 border-secondary/20 bg-card/80">
              <AlertCircle aria-hidden="true" />
              <AlertTitle>{t("previewTitle")}</AlertTitle>
              <AlertDescription>{t("previewDescription")}</AlertDescription>
            </Alert>
          ) : null}

          {isApiConfigured && (authStatus === "unknown" || query.isLoading) ? <DashboardLoading /> : null}
          {query.isError ? (
            <Alert variant="destructive" className="mb-6"><AlertCircle aria-hidden="true" /><AlertTitle>{t("errorTitle")}</AlertTitle><AlertDescription>{t("errorDescription")} <button className="font-bold underline" onClick={() => query.refetch()}>{t("retry")}</button></AlertDescription></Alert>
          ) : null}

          {(!isApiConfigured || query.isSuccess) ? (
            <div className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t("summary")}> 
                {statKeys.map((key, index) => {
                  const Icon = statIcons[index];
                  return (
                    <Card key={key} className="border-primary/10 bg-card/85 shadow-sm">
                      <CardContent className="flex items-center gap-4 p-5">
                        <span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary dark:bg-primary/15"><Icon aria-hidden="true" /></span>
                        <div><p className="text-2xl font-black tabular-nums">{statValues[index] ?? "—"}</p><p className="mt-1 text-sm text-muted-foreground">{t(key)}</p></div>
                      </CardContent>
                    </Card>
                  );
                })}
              </section>

              <div className="grid gap-6 xl:grid-cols-2">
                <Card className="border-primary/10 bg-card/85 shadow-sm">
                  <CardHeader className="flex-row items-center justify-between gap-4">
                    <div><p className="text-sm font-bold text-secondary">{t("learning")}</p><CardTitle className="mt-1 text-xl">{t("approvedCourses")}</CardTitle></div>
                    <Button asChild variant="ghost" size="sm" className="rounded-xl"><Link href={`/${locale}/dashboard/student/courses`}>{t("viewAll")}</Link></Button>
                  </CardHeader>
                  <CardContent>
                    {data?.approved_courses.length ? (
                      <div className="space-y-3">
                        {data.approved_courses.map((course) => (
                          <Link href={`/${locale}/courses/${course.id}`} key={course.id} className="flex items-center gap-4 rounded-2xl border border-border bg-background/55 p-4">
                            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><BookOpen aria-hidden="true" /></span>
                            <div className="min-w-0 flex-1"><p className="truncate font-bold">{course.title}</p><p className="mt-1 truncate text-sm text-muted-foreground">{course.language} · {course.level} · {course.schedule_day}</p></div>
                            <Badge variant="secondary">{t("active")}</Badge>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-background/40 px-5 text-center">
                        <div><BookOpen className="mx-auto size-9 text-muted-foreground" /><p className="mt-3 font-bold">{t("noApprovedCourses")}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("noApprovedCoursesDescription")}</p></div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-secondary-bright/15 bg-card/85 shadow-sm">
                  <CardHeader className="flex-row items-center justify-between gap-4"><div><p className="text-sm font-bold text-secondary">{t("requests")}</p><CardTitle className="mt-1 text-xl">{t("enrollmentRequests")}</CardTitle></div><Button asChild variant="ghost" size="sm" className="rounded-xl"><Link href={`/${locale}/dashboard/student/purchases`}>{t("viewAll")}</Link></Button></CardHeader>
                  <CardContent>
                    {data?.enrollments.length ? (
                      <div className="space-y-3">
                        {data.enrollments.map((enrollment) => {
                          const presentation = enrollmentStatusPresentation[enrollment.status];
                          return (
                            <div key={enrollment.id} className="rounded-2xl border border-border bg-background/55 p-4">
                              <div className="flex items-start justify-between gap-3"><p className="font-bold">{enrollment.course.title}</p><Badge variant={presentation.tone}>{statusT(presentation.labelKey)}</Badge></div>
                              <p className="mt-2 text-sm text-muted-foreground">{statusT(presentation.nextActionKey)}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-background/40 px-5 text-center">
                        <div><Clock3 className="mx-auto size-9 text-muted-foreground" /><p className="mt-3 font-bold">{t("noEnrollments")}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("noEnrollmentsDescription")}</p></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              {data ? <LearningRecords data={data} /> : null}
            </div>
          ) : null}
        </div>
      </main>
    </DashboardShell>
  );
}
