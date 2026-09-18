"use client";

import { AlertCircle, BookOpen, CalendarDays, Clock3 } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentDashboard } from "@/features/students/api";
import { isApiConfigured } from "@/lib/api/config";
import { queryKeys } from "@/lib/query/keys";
import { useAppSelector } from "@/store/hooks";

export function StudentCoursesPage() {
  const locale = useLocale();
  const fa = locale === "fa";
  const router = useRouter();
  const authStatus = useAppSelector((state) => state.auth.status);
  const query = useQuery({ queryKey: queryKeys.studentDashboard, queryFn: getStudentDashboard, enabled: isApiConfigured && authStatus === "student", retry: false });

  useEffect(() => {
    if (!isApiConfigured || authStatus === "unknown" || authStatus === "student") return;
    router.replace(authStatus === "guest" ? `/${locale}/login` : `/${locale}`);
  }, [authStatus, locale, router]);

  const title = fa ? "دوره‌های من" : "My courses";
  return <DashboardShell title={title}>
    <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-[1100px] space-y-6">
      <section className="rounded-3xl bg-primary px-6 py-8 text-primary-foreground"><p className="text-sm font-bold text-secondary-bright">{fa ? "یادگیری من" : "My learning"}</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2><p className="mt-2 text-primary-foreground/75">{fa ? "همه دوره‌هایی که ثبت‌نام آن‌ها تأیید شده، همراه با دسترسی مستقیم به جلسات." : "All approved courses with direct access to their lessons."}</p></section>
      {query.isLoading || authStatus === "unknown" ? <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-56 rounded-3xl" /><Skeleton className="h-56 rounded-3xl" /></div> : null}
      {query.isError ? <Alert variant="destructive"><AlertCircle /><AlertTitle>{fa ? "دریافت دوره‌ها انجام نشد" : "Could not load courses"}</AlertTitle><AlertDescription><button className="font-bold underline" onClick={() => query.refetch()}>{fa ? "تلاش دوباره" : "Try again"}</button></AlertDescription></Alert> : null}
      {query.data && query.data.approved_courses.length === 0 ? <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed bg-card px-6 text-center"><div><BookOpen className="mx-auto size-10 text-muted-foreground" /><h3 className="mt-4 text-xl font-bold">{fa ? "هنوز دوره فعالی نداری" : "No active courses yet"}</h3><p className="mt-2 text-muted-foreground">{fa ? "پس از تأیید پرداخت، دوره اینجا نمایش داده می‌شود." : "A course appears here after your payment is approved."}</p><Button asChild className="mt-5 rounded-xl"><Link href={`/${locale}/courses`}>{fa ? "پیداکردن دوره" : "Find a course"}</Link></Button></div></div> : null}
      {query.data?.approved_courses.length ? <div className="grid gap-5 md:grid-cols-2">{query.data.approved_courses.map((course) => <Card key={course.id} className="border-primary/10 bg-card/90 shadow-sm"><CardHeader><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-secondary">{course.language}</p><CardTitle className="mt-2 text-xl">{course.title}</CardTitle></div><Badge>{fa ? "فعال" : "Active"}</Badge></div></CardHeader><CardContent><p className="line-clamp-2 min-h-12 text-sm leading-6 text-muted-foreground">{course.description}</p><div className="mt-5 flex flex-wrap gap-4 border-t pt-4 text-sm text-muted-foreground"><span className="flex items-center gap-2"><CalendarDays className="size-4" />{course.schedule_day}</span><span className="flex items-center gap-2"><Clock3 className="size-4" />{course.schedule_start}–{course.schedule_end}</span></div><Button asChild className="mt-5 w-full rounded-xl"><Link href={`/${locale}/courses/${course.id}`}>{fa ? "ورود به دوره و جلسات" : "Open course and lessons"}</Link></Button></CardContent></Card>)}</div> : null}
    </div></main>
  </DashboardShell>;
}
