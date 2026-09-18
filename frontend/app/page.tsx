import type { Metadata } from "next";

import { LocaleExperience } from "@/components/providers/locale-experience";
import { localeAlternates } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "یادگیری زبان با دوره و استاد مناسب",
  description:
    "در Athenlio دوره‌های زبان و استادان مناسب هدفت را پیدا کن و مسیر یادگیری‌ات را مدیریت کن.",
  alternates: localeAlternates("fa"),
};

export default function HomePage() {
  return <LocaleExperience locale="fa" />;
}
