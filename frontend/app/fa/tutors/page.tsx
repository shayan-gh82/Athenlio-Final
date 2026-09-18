import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { TutorCatalog } from "@/features/tutors/components/tutor-catalog";
import { localeAlternates } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "استادان زبان",
  description: "استادان زبان را براساس تخصص و سبک تدریس بررسی و مقایسه کن.",
  alternates: localeAlternates("fa", "/tutors"),
};

export default function PersianTutorsPage() {
  return <LocaleProvider locale="fa"><TutorCatalog /></LocaleProvider>;
}
