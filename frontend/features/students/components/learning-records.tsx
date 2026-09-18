"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { enrollmentStatusPresentation } from "@/features/enrollments/types";
import type { StudentDashboardData } from "@/features/students/types";

export function LearningRecords({ data, section = "all" }: { data: StudentDashboardData; section?: "all" | "payments" | "homeworks" }) {
  const locale = useLocale(); const fa = locale === "fa";
  const statusT = useTranslations("enrollmentStatus");
  const homeworks = data.approved_courses.flatMap((course) => (course.lessons ?? []).flatMap((lesson) => (lesson.homeworks ?? []).map((homework) => ({ ...homework, course: course.title }))));
  return <div className="space-y-6">
    {section !== "homeworks" ? <section id="payments" className="scroll-mt-24 rounded-3xl border bg-card p-6"><h2 className="mb-5 text-xl font-bold">{fa ? "پرداخت‌ها و ثبت‌نام‌ها" : "Payments and enrollments"}</h2><p className="mb-4 text-sm text-muted-foreground">{fa ? "تأیید پرداخت‌ها توسط مدیر انجام می‌شود." : "Payments are reviewed manually by the administrator."}</p>
      {!data.enrollments.length ? <p>{fa ? "هنوز پرداختی ثبت نشده است." : "No payment records yet."}</p> : <div className="overflow-x-auto"><table className="w-full text-start text-sm"><thead><tr className="border-b"><th className="p-3 text-start">{fa ? "دوره" : "Course"}</th><th className="p-3 text-start">{fa ? "مبلغ" : "Amount"}</th><th className="p-3 text-start">{fa ? "وضعیت" : "Status"}</th><th className="p-3 text-start">{fa ? "رسید" : "Receipt"}</th></tr></thead><tbody>{data.enrollments.map((item) => { const presentation = enrollmentStatusPresentation[item.status]; return <tr key={item.id} className="border-b last:border-0"><td className="p-3"><Link href={`/${locale}/courses/${item.course.id}`} className="font-semibold underline">{item.course.title}</Link></td><td dir="ltr" className="p-3">{item.payment_amount ?? "—"} {item.currency}</td><td className="p-3"><Badge variant={presentation.tone}>{statusT(presentation.labelKey)}</Badge></td><td className="p-3">{item.payment_proof ? <a href={item.payment_proof} target="_blank" rel="noreferrer" className="underline">{fa ? "مشاهده رسید" : "View receipt"}</a> : "—"}</td></tr>; })}</tbody></table></div>}
    </section> : null}
    {section !== "payments" ? <section id="homeworks" className="scroll-mt-24 rounded-3xl border bg-card p-6"><h2 className="mb-5 text-xl font-bold">{fa ? "تکالیف من" : "My homework"}</h2>{!homeworks.length ? <p className="text-muted-foreground">{fa ? "برای دوره‌های تأییدشدهٔ شما هنوز تکلیفی ثبت نشده است." : "No homework has been assigned to your approved courses."}</p> : <ul className="space-y-3">{homeworks.map((item) => <li key={`${item.course}-${item.id}`} className="rounded-2xl border p-4"><h3 className="font-bold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.course} · {item.due_date}</p>{item.document ? <a className="mt-2 inline-block text-secondary underline" href={item.document} target="_blank" rel="noreferrer">{fa ? "دریافت تکلیف" : "Open assignment"}</a> : null}</li>)}</ul>}</section> : null}
  </div>;
}
