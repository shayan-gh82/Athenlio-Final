import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { TutorCatalog } from "@/features/tutors/components/tutor-catalog";
import { localeAlternates } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Language tutors",
  description: "Explore and compare language tutors by expertise and teaching style.",
  alternates: localeAlternates("en", "/tutors"),
};

export default function EnglishTutorsPage() {
  return <LocaleProvider locale="en"><TutorCatalog /></LocaleProvider>;
}
