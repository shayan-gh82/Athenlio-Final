import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { TutorDetail } from "@/features/tutors/components/tutor-detail";
import { localeAlternates } from "@/lib/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "پروفایل استاد",
    description: "تخصص، شیوه تدریس و دوره‌های استاد را در Athenlio ببینید.",
    alternates: localeAlternates("fa", `/tutors/${encodeURIComponent(id)}`),
  };
}

export default async function PersianTutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocaleProvider locale="fa"><TutorDetail tutorId={id} /></LocaleProvider>;
}
