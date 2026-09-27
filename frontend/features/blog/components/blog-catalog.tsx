"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CalendarDays, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CatalogLoading, CatalogState } from "@/features/catalog/components/catalog-state";
import { getBlogs } from "@/features/blog/api";
import { BlogCover } from "@/features/blog/components/blog-cover";
import type { BlogPost } from "@/features/blog/types";
import { isCatalogAvailable } from "@/lib/api/config";
import { queryKeys } from "@/lib/query/keys";

function postDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export function BlogCatalog() {
  const locale = useLocale();
  const t = useTranslations("blogCatalog");
  const [search, setSearch] = useState("");
  const Arrow = locale === "fa" ? ArrowLeft : ArrowRight;
  const query = useQuery({
    queryKey: [...queryKeys.blogs, locale],
    queryFn: () => getBlogs(locale),
    enabled: isCatalogAvailable,
    staleTime: 3 * 60_000,
  });
  const posts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase(locale);
    if (!term || !query.data) return query.data ?? [];
    return query.data.filter((post) => [post.title, post.description, post.author].join(" ").toLocaleLowerCase(locale).includes(term));
  }, [locale, query.data, search]);
  const featured = posts.find((post) => post.featured) ?? posts[0];
  const remaining = featured ? posts.filter((post) => post.id !== featured.id) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-secondary">{t("eyebrow")}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{t("description")}</p>
          </div>
          <div className="relative w-full lg:w-[390px]">
            <Search className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input aria-label={t("searchLabel")} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchPlaceholder")} className="h-12 rounded-xl bg-card ps-12" />
          </div>
        </div>

        <div className="mt-10">
          {!isCatalogAvailable ? <CatalogState kind="unconfigured" /> : null}
          {query.isLoading ? <CatalogLoading /> : null}
          {query.isError ? <CatalogState kind="error" onRetry={() => query.refetch()} /> : null}
          {query.isSuccess && posts.length === 0 ? <CatalogState kind="empty" /> : null}
          {query.isSuccess && featured ? <div className="space-y-8">
            <Card className="overflow-hidden border-primary/10 bg-card/90 py-0 shadow-md lg:grid lg:grid-cols-[1.03fr_0.97fr]">
              <BlogCover src={featured.picture} alt={featured.title} priority className="min-h-72 lg:min-h-[390px]" />
              <CardContent className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap gap-2"><Badge>{t("featured")}</Badge><DifficultyBadge post={featured} label={t(`difficulty.${featured.difficulty_level}`)} /></div>
                <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">{featured.title}</h2>
                <p className="mt-4 line-clamp-3 leading-8 text-muted-foreground">{featured.description}</p>
                <PostMeta post={featured} date={postDate(featured.created_at, locale)} />
                <Button asChild className="mt-7 w-fit rounded-xl"><Link href={`/${locale}/blog/${featured.id}`}>{t("readArticle")}<Arrow aria-hidden="true" /></Link></Button>
              </CardContent>
            </Card>

            {remaining.length ? <section aria-labelledby="latest-articles-title"><div className="mb-5 flex items-center justify-between gap-4"><h2 id="latest-articles-title" className="text-2xl font-bold">{t("latest")}</h2><span className="text-sm text-muted-foreground">{t("articleCount", { count: posts.length })}</span></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{remaining.map((post) => <ArticleCard key={post.id} post={post} locale={locale} readLabel={t("readArticle")} difficultyLabel={t(`difficulty.${post.difficulty_level}`)} />)}</div></section> : null}
          </div> : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ArticleCard({ post, locale, readLabel, difficultyLabel }: { post: BlogPost; locale: string; readLabel: string; difficultyLabel: string }) {
  return <Card className="overflow-hidden border-primary/10 bg-card/90 py-0 shadow-sm transition-transform duration-300 hover:-translate-y-1"><BlogCover src={post.picture} alt={post.title} className="h-48" /><CardHeader className="p-6 pb-3"><DifficultyBadge post={post} label={difficultyLabel} /><CardTitle className="line-clamp-2 text-xl leading-8">{post.title}</CardTitle></CardHeader><CardContent className="p-6 pt-0"><p className="line-clamp-3 min-h-20 text-sm leading-7 text-muted-foreground">{post.description}</p><PostMeta post={post} date={postDate(post.created_at, locale)} /><Button asChild variant="outline" className="mt-5 w-full rounded-xl"><Link href={`/${locale}/blog/${post.id}`}>{readLabel}</Link></Button></CardContent></Card>;
}

function DifficultyBadge({ post, label }: { post: BlogPost; label: string }) {
  return <Badge variant={post.difficulty_level === "Advanced" ? "default" : "secondary"}>{label}</Badge>;
}

function PostMeta({ post, date }: { post: BlogPost; date: string }) {
  return <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><UserRound className="size-4" aria-hidden="true" />{post.author}</span><time dateTime={post.created_at} className="flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden="true" />{date}</time></div>;
}
