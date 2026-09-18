import type { Metadata } from "next";

import { localeAlternates } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "یادگیری زبان با دوره و استاد مناسب",
  description:
    "در Athenlio دوره‌های زبان و استادان مناسب هدفت را پیدا کن و مسیر یادگیری‌ات را مدیریت کن.",
  alternates: localeAlternates("fa"),
  openGraph: {
    locale: "fa_IR",
    alternateLocale: ["en_US"],
  },
};

export default function PersianLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
