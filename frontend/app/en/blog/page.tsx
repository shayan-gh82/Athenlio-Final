import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { BlogCatalog } from "@/features/blog/components/blog-catalog";
import { localeAlternates } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Language learning journal",
  description: "Practical language-learning articles and guides from Athenlio.",
  alternates: localeAlternates("en", "/blog"),
};

export default function EnglishBlogPage() {
  return <LocaleProvider locale="en"><BlogCatalog /></LocaleProvider>;
}
