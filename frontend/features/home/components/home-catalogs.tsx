"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useLocale } from "next-intl";
import { BookOpen, GraduationCap, Newspaper } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { unwrapCollection, type PaginatedResponse } from "@/lib/api/collections";
import { isCatalogAvailable } from "@/lib/api/config";
import type { Course } from "@/features/courses/types";
import type { Tutor } from "@/features/tutors/types";
import type { BlogPost } from "@/features/blog/types";
import { normalizeTutorProfile } from "@/features/tutors/normalize";
import { Skeleton } from "@/components/ui/skeleton";

type PreviewItem = { id: number; title: string; description: string; image?: string | null };

async function loadItems(kind: "courses" | "tutors" | "blog", locale: string): Promise<PreviewItem[]> {
  if (kind === "courses") {
    const { data } = await apiClient.get<Course[] | PaginatedResponse<Course>>("/api/courses/", { headers: { "X-Demo-Locale": locale } });
    return unwrapCollection(data).sort((a, b) => b.active_students - a.active_students).slice(0, 3);
  }
  if (kind === "tutors") {
    const { data } = await apiClient.get<Tutor[] | PaginatedResponse<Tutor>>("/api/tutors/", { headers: { "X-Demo-Locale": locale } });
    return unwrapCollection(data).map(normalizeTutorProfile).filter((tutor) => tutor.is_approved === true).slice(0, 3).map((tutor) => ({ id: tutor.id, title: `${tutor.user.first_name} ${tutor.user.last_name}`, description: tutor.bio, image: tutor.profile_picture }));
  }
  const { data } = await apiClient.get<BlogPost[] | PaginatedResponse<BlogPost>>("/api/blogs/", { headers: { "X-Demo-Locale": locale } });
  return unwrapCollection(data).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 3).map((post) => ({ ...post, image: post.picture }));
}

function PreviewSection({ kind, title }: { kind: "courses" | "tutors" | "blog"; title: string }) {
  const locale = useLocale();
  const fa = locale === "fa";
  const query = useQuery({ queryKey: ["home", kind, locale], queryFn: () => loadItems(kind, locale), enabled: isCatalogAvailable });
  const Icon = kind === "courses" ? BookOpen : kind === "tutors" ? GraduationCap : Newspaper;
  return <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
    <div className="mb-6 flex items-center justify-between gap-3"><h2 className="text-2xl font-bold sm:text-3xl">{title}</h2><Link className="shrink-0 font-bold text-secondary" href={`/${locale}/${kind}`}>{fa ? "مشاهده همه" : "View all"} ←</Link></div>
    {query.isLoading ? <div className="grid gap-5 md:grid-cols-3">{[1, 2, 3].map((id) => <Skeleton key={id} className="h-64 rounded-3xl" />)}</div> : null}
    {query.isError ? <div role="alert" className="rounded-2xl border p-6">{fa ? "دریافت اطلاعات ممکن نشد." : "Unable to load this section."} <button onClick={() => query.refetch()} className="underline">{fa ? "تلاش دوباره" : "Retry"}</button></div> : null}
    {!isCatalogAvailable || (query.isSuccess && !query.data.length) ? <p className="rounded-2xl border border-dashed p-8 text-muted-foreground">{fa ? "هنوز موردی برای نمایش در این بخش موجود نیست." : "There are no items to show yet."}</p> : null}
    <div className="grid gap-5 md:grid-cols-3">{query.data?.map((item) => <Link href={`/${locale}/${kind}/${item.id}`} key={item.id} className="overflow-hidden rounded-3xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="grid h-44 place-items-center bg-primary-soft bg-cover bg-center text-primary" style={item.image ? { backgroundImage: `url(${JSON.stringify(item.image)})` } : undefined}>{!item.image ? <Icon className="size-12" /> : null}</div>
      <div className="p-6"><h3 dir="auto" className="line-clamp-2 text-start text-xl font-bold">{item.title}</h3><p dir="auto" className="mt-3 line-clamp-3 text-start text-sm leading-7 text-muted-foreground">{item.description}</p></div>
    </Link>)}</div>
  </section>;
}

export function HomeCatalogs() {
  const fa = useLocale() === "fa";
  return <div className="border-y bg-card/30 py-8"><PreviewSection kind="courses" title={fa ? "دوره‌های محبوب" : "Popular courses"} /><PreviewSection kind="tutors" title={fa ? "استادان منتخب" : "Featured tutors"} /><PreviewSection kind="blog" title={fa ? "تازه‌های مجله" : "Latest articles"} /></div>;
}
