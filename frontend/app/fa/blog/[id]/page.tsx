import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { BlogDetail } from "@/features/blog/components/blog-detail";
import { localeAlternates } from "@/lib/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "مقاله آموزشی",
    description: "یک مقاله کاربردی از مجله یادگیری زبان Athenlio.",
    alternates: localeAlternates("fa", `/blog/${encodeURIComponent(id)}`),
  };
}

export default async function PersianBlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocaleProvider locale="fa"><BlogDetail postId={id} /></LocaleProvider>;
}
