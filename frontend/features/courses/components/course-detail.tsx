"use client";

import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, CheckCircle2, Clock3, CreditCard, GraduationCap, Users } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CatalogState } from "@/features/catalog/components/catalog-state";
import { AddToCartButton } from "@/features/cart/components/cart-button";
import { removeCourseFromCart } from "@/features/cart/cart-store";
import type { Course } from "@/features/courses/types";
import { EnrollmentForm } from "@/features/enrollments/components/enrollment-form";
import { getStudentDashboard } from "@/features/students/api";
import { apiClient } from "@/lib/api/client";
import { isApiConfigured, isCatalogAvailable, isDemoMode } from "@/lib/api/config";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/keys";
import { useAppSelector } from "@/store/hooks";

export function CourseDetail({ courseId, autoEnroll = false }: { courseId: string; autoEnroll?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("courseDetail");
  const BackIcon = locale === "fa" ? ArrowRight : ArrowLeft;
  const authStatus = useAppSelector((state) => state.auth.status);
  const user = useAppSelector((state) => state.auth.user);
  const enrollmentQuery = useQuery({ queryKey: queryKeys.studentDashboard, queryFn: getStudentDashboard, enabled: isApiConfigured && authStatus === "student" });
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [autoEnrollmentDismissed, setAutoEnrollmentDismissed] = useState(false);
  const query = useQuery({
    queryKey: [...queryKeys.course(courseId), locale],
    queryFn: async () => (await apiClient.get<Course>(endpoints.courses.detail(courseId), { headers: { "X-Demo-Locale": locale } })).data,
    enabled: isCatalogAvailable,
    retry: false,
    staleTime: 3 * 60_000,
  });
  const course = query.data;
  const currentEnrollment = enrollmentQuery.data?.enrollments.find((item) => item.course.id === course?.id);
  const canReadLessons = currentEnrollment?.status === "approved" || (authStatus === "tutor-approved" && user?.tutor_id === course?.tutor?.id);
  const isEnrollmentDialogOpen = enrollmentOpen || (autoEnroll && authStatus === "student" && !autoEnrollmentDismissed);
  const dollarPrice = Number(course?.price_per_dollar ?? course?.price_per_hour ?? 0);
  const tomanPrice = Number(course?.price_per_toman ?? 0);
  const defaultCurrency = tomanPrice > 0 && !dollarPrice ? "TOMAN" as const : "USD" as const;
  const defaultAmount = defaultCurrency === "USD" ? dollarPrice : tomanPrice;
  const tutorUser = course?.tutor && typeof course.tutor.user === "object" ? course.tutor.user : null;
  const tutorName = tutorUser ? `${tutorUser.first_name ?? ""} ${tutorUser.last_name ?? ""}`.trim() || t("tutor") : t("tutor");
  const courseFacts = course ? [
    { icon: CalendarDays, value: course.schedule_day, key: "schedule" },
    { icon: Clock3, value: `${course.schedule_start}–${course.schedule_end}`, key: "time" },
    { icon: GraduationCap, value: course.level, key: "level" },
    { icon: Users, value: `${course.active_students}/${course.capacity}`, key: "students" },
  ] as const : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Button asChild variant="ghost" className="mb-6 -ms-3 rounded-xl"><Link href={`/${locale}/courses`}><BackIcon aria-hidden="true" />{t("back")}</Link></Button>
        {!isCatalogAvailable ? <CatalogState kind="unconfigured" /> : null}
        {query.isLoading ? <div className="space-y-5"><Skeleton className="h-72 rounded-3xl" /><div className="grid gap-5 lg:grid-cols-3"><Skeleton className="h-64 rounded-3xl lg:col-span-2" /><Skeleton className="h-64 rounded-3xl" /></div></div> : null}
        {query.isError ? <CatalogState kind="error" onRetry={() => query.refetch()} /> : null}
        {course ? (
          <div className="space-y-6">
            {canReadLessons ? <section className="rounded-3xl border bg-card p-6"><h2 className="mb-4 text-xl font-bold">{locale === "fa" ? "جلسات دوره" : "Course lessons"}</h2>{course.lessons?.length ? <ul className="space-y-4">{course.lessons.map((lesson) => <li key={lesson.id} className="rounded-2xl border p-4"><h3 className="font-bold">{lesson.title}</h3><p className="mt-2 leading-7">{lesson.description}</p><div className="mt-3 flex gap-5">{lesson.lesson_video ? <a href={lesson.lesson_video} target="_blank" rel="noreferrer" className="text-secondary underline">{locale === "fa" ? "مشاهده ویدیو" : "Watch video"}</a> : null}{lesson.lesson_document ? <a href={lesson.lesson_document} target="_blank" rel="noreferrer" className="text-secondary underline">{locale === "fa" ? "فایل جلسه" : "Lesson document"}</a> : null}</div></li>)}</ul> : <p>{locale === "fa" ? "هنوز محتوایی برای این دوره منتشر نشده است." : "No lessons have been published yet."}</p>}</section> : null}
            <section className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-10 text-primary-foreground shadow-xl shadow-primary/15 sm:px-10 lg:px-12">
              <div className="absolute -end-20 -top-28 size-80 rounded-full bg-secondary-bright/25 blur-3xl" aria-hidden="true" />
              <div className="relative max-w-3xl"><div className="flex flex-wrap gap-2"><Badge className="bg-white/12 text-white">{course.language}</Badge><Badge className="bg-white/12 text-white">{course.level}</Badge></div><h1 className="mt-5 text-3xl font-bold leading-tight sm:text-5xl">{course.title}</h1><p className="mt-5 text-lg leading-8 text-primary-foreground/75">{course.description}</p></div>
            </section>
            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                <Card className="border-primary/10 bg-card/88"><CardHeader><CardTitle>{t("about")}</CardTitle></CardHeader><CardContent className="space-y-5 leading-8 text-muted-foreground"><p>{course.detail || course.description}</p>{course.requirements ? <div><h2 className="font-bold text-foreground">{t("requirements")}</h2><p className="mt-2">{course.requirements}</p></div> : null}{course.materials ? <div><h2 className="font-bold text-foreground">{t("materials")}</h2><p className="mt-2">{course.materials}</p></div> : null}</CardContent></Card>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {courseFacts.map(({ icon: Icon, value, key }) => <Card key={key} className="bg-card/85"><CardContent className="p-5"><Icon aria-hidden="true" className="size-5 text-secondary" /><p className="mt-3 text-sm text-muted-foreground">{t(key)}</p><p className="mt-1 font-bold">{value}</p></CardContent></Card>)}
                </div>
                {course.tutor ? <Link href={`/${locale}/tutors/${course.tutor.id}`} className="flex items-center gap-4 rounded-3xl border border-primary/10 bg-card/88 p-5 transition-colors hover:border-primary/30"><Avatar className="size-14 rounded-2xl"><AvatarImage className="object-cover" src={course.tutor.profile_picture ?? undefined} alt="" /><AvatarFallback className="rounded-2xl bg-primary-soft font-bold text-primary">{tutorName.slice(0, 1)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="text-sm font-bold text-secondary">{t("courseTutor")}</p><p className="mt-1 truncate text-lg font-bold">{tutorName}</p><p className="mt-1 text-sm text-muted-foreground">{t("viewTutorProfile")}</p></div><BackIcon className="size-5 rotate-180 text-muted-foreground" aria-hidden="true" /></Link> : null}
              </div>
              <Card className="h-fit border-secondary-bright/20 bg-card/92 shadow-lg shadow-primary/8 lg:sticky lg:top-24">
                <CardHeader><p className="text-sm font-bold text-secondary">{t("enrollment")}</p><CardTitle className="text-2xl">{dollarPrice > 0 ? `${dollarPrice.toLocaleString()} USD` : tomanPrice > 0 ? `${tomanPrice.toLocaleString()} TOMAN` : t("priceUnavailable")}</CardTitle></CardHeader>
                <CardContent className="space-y-4"><div className="space-y-3 text-sm text-muted-foreground"><p className="flex gap-2"><CheckCircle2 className="size-5 shrink-0 text-secondary" />{t("proofRequired")}</p><p className="flex gap-2"><CheckCircle2 className="size-5 shrink-0 text-secondary" />{t("manualReview")}</p></div>
                  {isDemoMode ? <><p className="text-sm leading-6 text-muted-foreground">{locale === "fa" ? "ثبت‌نام و پرداخت در این دمو غیرفعال است؛ می‌توانی سبد خرید را آزمایش کنی." : "Enrollment and payments are disabled in this demo. You can try the cart."}</p><AddToCartButton courseId={course.id} className="h-11 w-full rounded-xl" /></> : currentEnrollment ? <Button asChild className="h-11 w-full rounded-xl"><Link href={`/${locale}/dashboard/student/purchases`}><CheckCircle2 aria-hidden="true" />{locale === "fa" ? "مشاهده وضعیت خرید" : "View purchase status"}</Link></Button> : authStatus === "student" ? <><Button className="h-11 w-full rounded-xl" onClick={() => setEnrollmentOpen(true)}><CreditCard aria-hidden="true" />{t("requestEnrollment")}</Button><AddToCartButton courseId={course.id} className="h-11 w-full rounded-xl" /></> : authStatus === "guest" ? <><Button asChild className="h-11 w-full rounded-xl"><Link href={`/${locale}/login?next=${encodeURIComponent(`/${locale}/courses/${courseId}?enroll=1`)}`}><BookOpen aria-hidden="true" />{t("loginToEnroll")}</Link></Button><AddToCartButton courseId={course.id} className="h-11 w-full rounded-xl" /></> : <Button className="h-11 w-full rounded-xl" disabled>{t("studentOnly")}</Button>}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter />
      {course ? (
        <Dialog open={isEnrollmentDialogOpen} onOpenChange={(open) => { setEnrollmentOpen(open); if (!open) setAutoEnrollmentDismissed(true); }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-xl">
            <DialogHeader className="text-start"><DialogTitle className="text-xl">{t("dialogTitle")}</DialogTitle><DialogDescription>{t("dialogDescription", { course: course.title })}</DialogDescription></DialogHeader>
            <EnrollmentForm courseId={course.id} defaultAmount={defaultAmount} defaultCurrency={defaultCurrency} onSuccess={() => { removeCourseFromCart(course.id); setEnrollmentOpen(false); setAutoEnrollmentDismissed(true); }} />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
