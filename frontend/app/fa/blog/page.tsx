import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { BlogCatalog } from "@/features/blog/components/blog-catalog";
import { localeAlternates } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "مجله یادگیری زبان",
  description: "مقاله‌ها و راهنماهای کاربردی یادگیری زبان در Athenlio.",
  alternates: localeAlternates("fa", "/blog"),
};

export default function PersianBlogPage() {
  return <LocaleProvider locale="fa"><BlogCatalog /></LocaleProvider>;
}
