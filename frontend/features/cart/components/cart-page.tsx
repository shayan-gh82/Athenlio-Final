"use client";

import { ArrowLeft, ArrowRight, BookOpen, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseCart } from "@/features/cart/cart-store";
import type { Course } from "@/features/courses/types";
import { getStudentDashboard } from "@/features/students/api";
import { apiClient } from "@/lib/api/client";
import { unwrapCollection, type PaginatedResponse } from "@/lib/api/collections";
import { isApiConfigured, isCatalogAvailable, isDemoMode } from "@/lib/api/config";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/keys";
import { useAppSelector } from "@/store/hooks";

function price(course: Course) {
  const dollar = Number(course.price_per_dollar ?? course.price_per_hour ?? 0);
  const toman = Number(course.price_per_toman ?? 0);
  return dollar > 0 ? { amount: dollar, currency: "USD" } : toman > 0 ? { amount: toman, currency: "TOMAN" } : null;
}

export function CartPage() {
  const locale = useLocale();
  const fa = locale === "fa";
  const BackIcon = fa ? ArrowRight : ArrowLeft;
  const cart = useCourseCart();
  const authStatus = useAppSelector((state) => state.auth.status);
  const coursesQuery = useQuery({
    queryKey: [...queryKeys.courseList, locale],
    queryFn: async () => unwrapCollection((await apiClient.get<Course[] | PaginatedResponse<Course>>(endpoints.courses.list, { headers: { "X-Demo-Locale": locale } })).data),
    enabled: isCatalogAvailable && cart.isReady && cart.count > 0,
  });
  const dashboardQuery = useQuery({
    queryKey: queryKeys.studentDashboard,
    queryFn: getStudentDashboard,
    enabled: isApiConfigured && authStatus === "student",
  });
  const courses = (coursesQuery.data ?? []).filter((course) => cart.courseIds.includes(course.id));
  const missingIds = cart.courseIds.filter((id) => !courses.some((course) => course.id === id));
  const totals = courses.reduce((result, course) => {
    const item = price(course);
    if (item) result[item.currency] = (result[item.currency] ?? 0) + item.amount;
    return result;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Button asChild variant="ghost" className="mb-6 -ms-3 rounded-xl"><Link href={`/${locale}/courses`}><BackIcon aria-hidden="true" />{fa ? "بازگشت به دوره‌ها" : "Back to courses"}</Link></Button>
        <section className="mb-7 overflow-hidden rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground sm:px-9">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div><p className="text-sm font-bold text-secondary-bright">{fa ? "انتخاب‌های شما" : "Your selection"}</p><h1 className="mt-2 text-3xl font-bold">{fa ? "سبد خرید دوره‌ها" : "Course cart"}</h1><p className="mt-3 text-primary-foreground/75">{fa ? "دوره‌ها را مرور کن و برای هر دوره اطلاعات پرداخت و رسید را جداگانه ثبت کن." : "Review your courses, then submit payment details and a receipt for each course."}</p></div>
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white/12"><ShoppingCart className="size-8" aria-hidden="true" /></span>
          </div>
        </section>

        {!cart.isReady || coursesQuery.isLoading ? <div className="space-y-4"><Skeleton className="h-40 rounded-3xl" /><Skeleton className="h-40 rounded-3xl" /></div> : null}
        {cart.isReady && cart.count === 0 ? <div className="grid min-h-72 place-items-center rounded-3xl border border-dashed bg-card px-6 text-center"><div><ShoppingCart className="mx-auto size-11 text-muted-foreground" /><h2 className="mt-4 text-xl font-bold">{fa ? "سبد خرید خالی است" : "Your cart is empty"}</h2><p className="mt-2 text-muted-foreground">{fa ? "از فهرست دوره‌ها، موارد دلخواه را به سبد اضافه کن." : "Add courses from the catalog to get started."}</p><Button asChild className="mt-5 rounded-xl"><Link href={`/${locale}/courses`}>{fa ? "مشاهده دوره‌ها" : "Browse courses"}</Link></Button></div></div> : null}
        {coursesQuery.isError ? <div className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 text-center"><p>{fa ? "دریافت اطلاعات سبد خرید انجام نشد." : "We could not load your cart."}</p><Button type="button" variant="outline" className="mt-4" onClick={() => coursesQuery.refetch()}>{fa ? "تلاش دوباره" : "Try again"}</Button></div> : null}

        {courses.length ? <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">{courses.map((course) => {
            const itemPrice = price(course);
            const enrollment = dashboardQuery.data?.enrollments.find((item) => item.course.id === course.id);
            return <Card key={course.id} className="border-primary/10 bg-card/90"><CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"><BookOpen aria-hidden="true" /></span><div className="min-w-0 flex-1"><h2 className="truncate text-lg font-bold">{course.title}</h2><p className="mt-1 text-sm text-muted-foreground">{course.language} · {course.level}</p><p className="mt-2 font-bold text-primary">{itemPrice ? `${itemPrice.amount.toLocaleString(locale)} ${itemPrice.currency}` : (fa ? "قیمت نامشخص" : "Price unavailable")}</p>{enrollment ? <Badge className="mt-2" variant={enrollment.status === "approved" ? "default" : "secondary"}>{enrollment.status === "approved" ? (fa ? "خرید تأییدشده" : "Approved purchase") : (fa ? "درخواست قبلاً ثبت شده" : "Request already submitted")}</Badge> : null}</div><div className="flex shrink-0 gap-2 sm:flex-col"><Button asChild className="flex-1 rounded-xl"><Link href={enrollment ? `/${locale}/dashboard/student/purchases` : `/${locale}/courses/${course.id}?enroll=1`}>{enrollment ? (fa ? "مشاهده وضعیت" : "View status") : (fa ? isDemoMode ? "مشاهده دوره" : "ادامه خرید" : isDemoMode ? "View course" : "Continue")}</Link></Button><Button type="button" variant="ghost" size="icon" className="rounded-xl text-destructive" aria-label={fa ? "حذف از سبد" : "Remove from cart"} onClick={() => cart.remove(course.id)}><Trash2 aria-hidden="true" /></Button></div></CardContent></Card>;
          })}</div>
          <Card className="h-fit border-secondary-bright/20 bg-card/92 lg:sticky lg:top-24"><CardHeader><CardTitle>{fa ? "خلاصه سبد" : "Cart summary"}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex justify-between"><span className="text-muted-foreground">{fa ? "تعداد دوره" : "Courses"}</span><strong>{courses.length}</strong></div>{Object.entries(totals).map(([currency, amount]) => <div key={currency} className="flex justify-between border-t pt-4"><span>{fa ? "جمع" : "Total"} ({currency})</span><strong>{amount.toLocaleString(locale)}</strong></div>)}<p className="border-t pt-4 text-xs leading-6 text-muted-foreground">{fa ? "به‌دلیل نیاز به رسید مجزا، پرداخت هر دوره جداگانه ثبت می‌شود." : "Each course is submitted separately because every enrollment needs its own receipt."}</p><Button type="button" variant="ghost" className="w-full rounded-xl text-destructive" onClick={cart.clear}><Trash2 aria-hidden="true" />{fa ? "خالی‌کردن سبد" : "Clear cart"}</Button></CardContent></Card>
        </div> : null}
        {missingIds.length > 0 && coursesQuery.isSuccess ? <p className="mt-5 text-sm text-muted-foreground">{fa ? "برخی دوره‌های سبد دیگر در دسترس نیستند." : "Some courses in your cart are no longer available."}</p> : null}
      </main>
      <SiteFooter />
    </div>
  );
}
