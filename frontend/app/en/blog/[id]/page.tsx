import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { BlogDetail } from "@/features/blog/components/blog-detail";
import { localeAlternates } from "@/lib/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Learning article",
    description: "A practical article from the Athenlio language-learning journal.",
    alternates: localeAlternates("en", `/blog/${encodeURIComponent(id)}`),
  };
}

export default async function EnglishBlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocaleProvider locale="en"><BlogDetail postId={id} /></LocaleProvider>;
}
