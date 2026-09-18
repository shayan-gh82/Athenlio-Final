"use client";

import { AlertCircle, BookOpen, CheckCircle2, Clock3, ExternalLink, FileCheck2, RefreshCw, Search, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { enrollmentStatusPresentation } from "@/features/enrollments/types";
import { EnrollmentReviewActions } from "@/features/enrollments/components/enrollment-review-actions";
import { getTutorDashboard } from "@/features/tutors/api";
import { isApiConfigured } from "@/lib/api/config";
import { queryKeys } from "@/lib/query/keys";
import { useAppSelector } from "@/store/hooks";

const statIcons = [BookOpen, Clock3, CheckCircle2, Users] as const;

export function TutorDashboard() {
  const locale = useLocale();
  const t = useTranslations("tutorDashboard");
  const statusT = useTranslations("enrollmentStatus");
  const router = useRouter();
  const queryClient = useQueryClient();
  const authStatus = useAppSelector((state) => state.auth.status);
  const user = useAppSelector((state) => state.auth.user);
  const canLoad = authStatus === "tutor-pending" || authStatus === "tutor-approved";
  const query = useQuery({
    queryKey: queryKeys.tutorDashboard,
    queryFn: getTutorDashboard,
    enabled: isApiConfigured && canLoad,
    retry: false,
    staleTime: 45_000,
  });

  useEffect(() => {
    if (!isApiConfigured || authStatus === "unknown" || canLoad) return;
    if (authStatus === "tutor-no-profile") router.replace(`/${locale}/dashboard/tutor/onboarding`);
    else router.replace(authStatus === "guest" ? `/${locale}/login` : `/${locale}`);
  }, [authStatus, canLoad, locale, router]);

  const data = query.data;
  const stats = data ? [
    data.courses.length,
    data.enrollments.filter((item) => item.status === "under_review").length,
    data.enrollments.filter((item) => item.status === "approved").length,
    data.courses.reduce((total, course) => total + course.active_students, 0),
  ] : [null, null, null, null];
  const statKeys = ["coursesCount", "waitingReview", "approvedEnrollments", "activeStudents"] as const;
  const reviewQueue = data ? [
    ...data.enrollments.filter((item) => item.status === "under_review"),
    ...data.enrollments.filter((item) => item.status !== "under_review").slice(0, 5),
  ] : [];

  return (
    <DashboardShell title={t("pageTitle")} area="tutor" avatarSrc={data?.tutor.profile_picture}>
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-[1400px]">
          <section className="relative mb-6 overflow-hidden rounded-3xl bg-primary px-6 py-7 text-primary-foreground shadow-lg shadow-primary/15 sm:px-8">
            <div className="absolute -end-14 -top-20 size-60 rounded-full bg-secondary-bright/25 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div><p className="flex items-center gap-2 text-sm font-bold text-secondary-bright"><Sparkles className="size-4" />{t("eyebrow")}</p><h2 className="mt-3 text-2xl font-bold sm:text-3xl">{t("welcome", { name: user?.first_name || t("tutor") })}</h2><p className="mt-2 max-w-2xl leading-7 text-primary-foreground/75">{t("welcomeDescription")}</p></div>
              <Button asChild variant="secondary" className="h-11 shrink-0 rounded-xl bg-white text-primary hover:bg-white/90"><Link href={`/${locale}/courses`}><Search />{t("viewPublicCourses")}</Link></Button>
            </div>
          </section>

          {!isApiConfigured ? <Alert className="mb-6 border-secondary/20 bg-card/80"><AlertCircle /><AlertTitle>{t("previewTitle")}</AlertTitle><AlertDescription>{t("previewDescription")}</AlertDescription></Alert> : null}
          {authStatus === "tutor-pending" ? <Alert className="mb-6 border-warning/25 bg-accent/10"><Clock3 /><AlertTitle>{t("pendingTitle")}</AlertTitle><AlertDescription className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"><span>{t("pendingDescription")}</span><Button type="button" variant="outline" size="sm" className="shrink-0 rounded-xl" onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.me })}><RefreshCw />{t("refreshApproval")}</Button></AlertDescription></Alert> : null}

          {isApiConfigured && (authStatus === "unknown" || query.isLoading) ? <DashboardLoading /> : null}
          {query.isError ? <Alert variant="destructive" className="mb-6"><AlertCircle /><AlertTitle>{t("errorTitle")}</AlertTitle><AlertDescription>{t("errorDescription")} <button className="font-bold underline" onClick={() => query.refetch()}>{t("retry")}</button></AlertDescription></Alert> : null}

          {authStatus === "tutor-approved" && query.isSuccess ? <div className="space-y-6">
            <Button asChild className="h-12 rounded-xl"><Link href={`/${locale}/dashboard/tutor/courses`}>{locale === "fa" ? "＋ ساخت دوره جدید و مدیریت دوره‌ها" : "＋ Create a course and manage courses"}</Link></Button>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={t("summary")}>
              {statKeys.map((key, index) => { const Icon = statIcons[index]; return <Card key={key} className="border-primary/10 bg-card/85 shadow-sm"><CardContent className="flex items-center gap-4 p-5"><span className="grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary dark:bg-primary/15"><Icon /></span><div><p className="text-2xl font-black tabular-nums">{stats[index] ?? "—"}</p><p className="mt-1 text-sm text-muted-foreground">{t(key)}</p></div></CardContent></Card>; })}
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card id="courses" className="scroll-mt-24 border-primary/10 bg-card/85 shadow-sm">
                <CardHeader className="flex-row items-center justify-between gap-4"><div><p className="text-sm font-bold text-secondary">{t("management")}</p><CardTitle className="mt-1 text-xl">{t("myCourses")}</CardTitle></div><div className="flex items-center gap-2"><Badge variant={authStatus === "tutor-approved" ? "secondary" : "outline"}>{authStatus === "tutor-approved" ? t("approvedAccount") : t("approvalRequired")}</Badge>{authStatus === "tutor-approved" ? <Button asChild variant="outline" size="sm" className="rounded-xl"><Link href={`/${locale}/dashboard/tutor/courses`}>{t("manageCourses")}</Link></Button> : null}</div></CardHeader>
                <CardContent>{data?.courses.length ? <div className="space-y-3">{data.courses.slice(0, 4).map((course) => <Link key={course.id} href={`/${locale}/courses/${course.id}`} className="flex items-center gap-4 rounded-2xl border border-border bg-background/55 p-4 transition-colors hover:border-primary/30"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><BookOpen /></span><div className="min-w-0 flex-1"><p className="truncate font-bold">{course.title}</p><p className="mt-1 truncate text-sm text-muted-foreground">{course.language} · {course.level} · {course.active_students}/{course.capacity}</p></div><ExternalLink className="size-4 text-muted-foreground" /></Link>)}</div> : <EmptyState icon={BookOpen} title={t("noCourses")} description={t("noCoursesDescription")} />}</CardContent>
              </Card>

              <Card id="requests" className="scroll-mt-24 border-secondary-bright/15 bg-card/85 shadow-sm">
                <CardHeader><p className="text-sm font-bold text-secondary">{t("students")}</p><CardTitle className="mt-1 text-xl">{t("enrollmentRequests")}</CardTitle></CardHeader>
                <CardContent>{reviewQueue.length ? <div className="space-y-3">{reviewQueue.map((enrollment) => { const presentation = enrollmentStatusPresentation[enrollment.status]; return <div key={enrollment.id} className="rounded-2xl border border-border bg-background/55 p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold">{enrollment.course.title}</p><p className="mt-1 text-sm text-muted-foreground">{enrollment.payment_amount ?? "—"} {enrollment.currency}</p></div><Badge variant={presentation.tone}>{statusT(presentation.labelKey)}</Badge></div>{enrollment.payment_proof ? <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0"><a href={enrollment.payment_proof} target="_blank" rel="noreferrer"><FileCheck2 />{t("viewReceipt")}</a></Button> : null}{authStatus === "tutor-approved" ? <EnrollmentReviewActions enrollment={enrollment} /> : null}</div>; })}</div> : <EmptyState icon={Clock3} title={t("noRequests")} description={t("noRequestsDescription")} />}</CardContent>
              </Card>
            </div>
          </div> : null}
          {authStatus === "tutor-approved" && data ? <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>{locale === "fa" ? "دانش‌آموزان من" : "My students"}</CardTitle></CardHeader><CardContent><ul className="space-y-3">{data.enrollments.filter((item) => item.status === "approved").map((item) => <li key={item.id} className="rounded-xl border p-3"><p className="font-bold">{item.student_name || (locale === "fa" ? "دانش‌آموز" : "Student")}</p><p className="text-sm text-muted-foreground">{item.course.title}</p></li>)}</ul>{!data.enrollments.some((item) => item.status === "approved") ? <p>{locale === "fa" ? "هنوز دانش‌آموز تأییدشده‌ای ندارید." : "No approved students yet."}</p> : null}</CardContent></Card>
            <Card><CardHeader><CardTitle>{locale === "fa" ? "بازخورد دانش‌آموزان" : "Student feedback"}</CardTitle></CardHeader><CardContent>{data.reviews?.length ? <ul className="space-y-4">{data.reviews.map((review) => <li key={review.id} className="rounded-xl border p-3"><p className="font-bold">{review.student__user__first_name} {review.student__user__last_name} · {review.rating}/5</p><p dir="auto" className="mt-2 text-start leading-7">{review.review_text}</p></li>)}</ul> : <p>{locale === "fa" ? "هنوز بازخوردی ثبت نشده است." : "No feedback yet."}</p>}</CardContent></Card>
          </div> : null}
        </div>
      </main>
    </DashboardShell>
  );
}

function DashboardLoading() {
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-32 rounded-2xl" />)}</div><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-80 rounded-3xl" /><Skeleton className="h-80 rounded-3xl" /></div></div>;
}

function EmptyState({ icon: Icon, title, description }: { icon: typeof BookOpen; title: string; description: string }) {
  return <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-border bg-background/40 px-5 text-center"><div><Icon className="mx-auto size-9 text-muted-foreground" /><p className="mt-3 font-bold">{title}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div></div>;
}
