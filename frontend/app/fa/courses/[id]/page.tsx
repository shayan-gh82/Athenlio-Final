import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { CourseDetail } from "@/features/courses/components/course-detail";
import { localeAlternates } from "@/lib/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "جزئیات دوره زبان",
    description: "جزئیات، زمان‌بندی و شرایط ثبت‌نام دوره زبان را در Athenlio ببینید.",
    alternates: localeAlternates("fa", `/courses/${encodeURIComponent(id)}`),
  };
}

export default async function PersianCourseDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ enroll?: string }> }) {
  const { id } = await params;
  const { enroll } = await searchParams;
  return <LocaleProvider locale="fa"><CourseDetail courseId={id} autoEnroll={enroll === "1"} /></LocaleProvider>;
}
