import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { TutorDetail } from "@/features/tutors/components/tutor-detail";
import { localeAlternates } from "@/lib/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Tutor profile",
    description: "Explore a tutor's expertise, teaching style and courses on Athenlio.",
    alternates: localeAlternates("en", `/tutors/${encodeURIComponent(id)}`),
  };
}

export default async function EnglishTutorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocaleProvider locale="en"><TutorDetail tutorId={id} /></LocaleProvider>;
}
