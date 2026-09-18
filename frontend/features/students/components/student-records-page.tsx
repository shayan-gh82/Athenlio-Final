"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentDashboard } from "@/features/students/api";
import { LearningRecords } from "@/features/students/components/learning-records";
import { isApiConfigured } from "@/lib/api/config";
import { queryKeys } from "@/lib/query/keys";
import { useAppSelector } from "@/store/hooks";

export function StudentRecordsPage({ section }: { section: "payments" | "purchases" | "homeworks" }) {
  const locale = useLocale();
  const fa = locale === "fa";
  const router = useRouter();
  const authStatus = useAppSelector((state) => state.auth.status);
  const query = useQuery({
    queryKey: queryKeys.studentDashboard,
    queryFn: getStudentDashboard,
    enabled: isApiConfigured && authStatus === "student",
    retry: false,
  });

  useEffect(() => {
    if (!isApiConfigured || authStatus === "unknown" || authStatus === "student") return;
    router.replace(authStatus === "guest" ? `/${locale}/login` : `/${locale}`);
  }, [authStatus, locale, router]);

  const title = section === "payments" || section === "purchases"
    ? (section === "purchases" ? (fa ? "خریدها و ثبت‌نام‌های من" : "My purchases and enrollments") : (fa ? "پرداخت‌های من" : "My payments"))
    : (fa ? "تکالیف من" : "My assignments");

  return <DashboardShell title={title}>
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1100px] space-y-6">
        <div className="rounded-3xl bg-primary px-6 py-8 text-primary-foreground">
          <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
          <p className="mt-2 text-primary-foreground/75">{section === "payments" || section === "purchases"
            ? (fa ? "رسیدها و وضعیت بررسی ثبت‌نام‌های دوره را اینجا دنبال کنید." : "Track receipts and enrollment review status here.")
            : (fa ? "تکالیف دوره‌های تأییدشده و فایل‌های مربوط را اینجا ببینید." : "View assignments and files for your approved courses here.")}</p>
        </div>
        {!isApiConfigured ? <Alert><AlertCircle /><AlertTitle>{fa ? "بک‌اند متصل نیست" : "Backend is not connected"}</AlertTitle><AlertDescription>{fa ? "آدرس API را در فایل محیطی تنظیم کنید." : "Configure the API URL in the environment file."}</AlertDescription></Alert> : null}
        {query.isLoading || authStatus === "unknown" ? <Skeleton className="h-72 rounded-3xl" /> : null}
        {query.isError ? <Alert variant="destructive"><AlertCircle /><AlertTitle>{fa ? "خطا در دریافت اطلاعات" : "Could not load data"}</AlertTitle><AlertDescription><button className="font-bold underline" onClick={() => query.refetch()}>{fa ? "تلاش دوباره" : "Retry"}</button></AlertDescription></Alert> : null}
        {query.data ? <LearningRecords data={query.data} section={section === "purchases" ? "payments" : section} /> : null}
      </div>
    </main>
  </DashboardShell>;
}
