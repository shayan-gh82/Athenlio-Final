"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, CalendarDays, UserRound } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getBlog } from "@/features/blog/api";
import { BlogCover } from "@/features/blog/components/blog-cover";
import { CatalogLoading, CatalogState } from "@/features/catalog/components/catalog-state";
import { isCatalogAvailable } from "@/lib/api/config";
import { normalizeApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/keys";

function articleDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function BlogDetail({ postId }: { postId: string }) {
  const locale = useLocale();
  const t = useTranslations("blogDetail");
  const BackArrow = locale === "fa" ? ArrowRight : ArrowLeft;
  const query = useQuery({
    queryKey: [...queryKeys.blog(postId), locale],
    queryFn: () => getBlog(postId, locale),
    enabled: isCatalogAvailable,
    retry: false,
    staleTime: 3 * 60_000,
  });
  const isNotFound = query.isError && normalizeApiError(query.error).status === 404;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {!query.data && !query.isError ? <h1 className="sr-only">{t("pageTitle")}</h1> : null}
        <Button asChild variant="ghost" className="mb-6 rounded-xl">
          <Link href={`/${locale}/blog`}><BackArrow aria-hidden="true" />{t("back")}</Link>
        </Button>

        {!isCatalogAvailable ? <CatalogState kind="unconfigured" /> : null}
        {query.isLoading ? <CatalogLoading /> : null}
        {query.isError ? isNotFound ? (
          <div className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-primary/20 bg-card/70 p-8 text-center">
            <div>
              <h1 className="text-2xl font-bold">{t("notFoundTitle")}</h1>
              <p className="mt-3 leading-8 text-muted-foreground">{t("notFoundDescription")}</p>
              <Button asChild className="mt-6 rounded-xl"><Link href={`/${locale}/blog`}>{t("back")}</Link></Button>
            </div>
          </div>
        ) : <CatalogState kind="error" onRetry={() => query.refetch()} /> : null}

        {query.data ? (
          <article>
            <header className="mx-auto max-w-4xl text-center">
              <div className="flex justify-center gap-2">
                <Badge>{t(`difficulty.${query.data.difficulty_level}`)}</Badge>
                {query.data.featured ? <Badge variant="secondary">{t("featured")}</Badge> : null}
              </div>
              <h1 dir="auto" className="mt-6 text-balance text-4xl font-bold leading-tight sm:text-5xl">{query.data.title}</h1>
              <p dir="auto" className="mx-auto mt-5 max-w-3xl text-start text-lg leading-8 text-muted-foreground">{query.data.description.length > 360 ? `${query.data.description.slice(0, 360)}…` : query.data.description}</p>
              {query.data.description.length > 360 ? <details className="mx-auto mt-3 max-w-3xl text-start"><summary className="cursor-pointer text-secondary">{locale === "fa" ? "توضیحات کامل" : "Full description"}</summary><p dir="auto" className="mt-3 text-start leading-8">{query.data.description}</p></details> : null}
              <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><UserRound className="size-4" aria-hidden="true" />{query.data.author}</span>
                <time dateTime={query.data.created_at} className="flex items-center gap-2"><CalendarDays className="size-4" aria-hidden="true" />{articleDate(query.data.created_at, locale)}</time>
              </div>
            </header>
            <BlogCover src={query.data.picture} alt={query.data.title} priority className="mt-10 aspect-[16/7] min-h-64 rounded-3xl shadow-lg" />
            <Card className="mx-auto -mt-10 max-w-4xl border-primary/10 bg-card/95 shadow-xl backdrop-blur">
              <CardContent className="space-y-6 p-6 text-base leading-9 sm:p-10 sm:text-lg">
                {query.data.content.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
                  <p dir="auto" key={`${query.data.id}-${index}`} className="whitespace-pre-line break-words text-start">{paragraph.trim()}</p>
                ))}
              </CardContent>
            </Card>
          </article>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
