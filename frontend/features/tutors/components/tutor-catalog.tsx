"use client";

import { ArrowUpRight, Globe2, Search, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CatalogLoading, CatalogState } from "@/features/catalog/components/catalog-state";
import { normalizeTutorProfile } from "@/features/tutors/normalize";
import type { Tutor } from "@/features/tutors/types";
import { apiClient } from "@/lib/api/client";
import { unwrapCollection, type PaginatedResponse } from "@/lib/api/collections";
import { isCatalogAvailable } from "@/lib/api/config";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/keys";

function tutorName(tutor: Tutor) {
  return `${tutor.user.first_name ?? ""} ${tutor.user.last_name ?? ""}`.trim() || tutor.user.email;
}

export function TutorCatalog() {
  const t = useTranslations("tutorCatalog");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: [...queryKeys.tutors(), locale],
    queryFn: async () => {
      const response = await apiClient.get<Tutor[] | PaginatedResponse<Tutor>>(endpoints.tutors.list, { headers: { "X-Demo-Locale": locale } });
      return unwrapCollection(response.data).map(normalizeTutorProfile).filter((tutor) => tutor.is_approved === true);
    },
    enabled: isCatalogAvailable,
    staleTime: 3 * 60_000,
  });

  const tutors = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term || !query.data) return query.data ?? [];
    return query.data.filter((tutor) => [tutorName(tutor), tutor.country, ...tutor.subjects].join(" ").toLocaleLowerCase().includes(term));
  }, [query.data, search]);

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
            <Input aria-label={t("searchPlaceholder")} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchPlaceholder")} className="h-12 rounded-xl bg-card ps-12" />
          </div>
        </div>

        <div className="mt-10">
          {!isCatalogAvailable ? <CatalogState kind="unconfigured" /> : null}
          {query.isLoading ? <CatalogLoading /> : null}
          {query.isError ? <CatalogState kind="error" onRetry={() => query.refetch()} /> : null}
          {query.isSuccess && tutors.length === 0 ? <CatalogState kind="empty" /> : null}
          {query.isSuccess && tutors.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {tutors.map((tutor) => (
                <Card key={tutor.id} className="border-secondary-bright/15 bg-card/90 shadow-sm transition-transform duration-300 hover:-translate-y-1">
                  <CardHeader className="flex-row items-center gap-4">
                    <Avatar className="size-14 rounded-2xl"><AvatarImage className="object-cover" src={tutor.profile_picture ?? undefined} alt="" /><AvatarFallback className="rounded-2xl bg-secondary-bright/12 font-bold text-secondary">{tutorName(tutor).slice(0, 1).toUpperCase()}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-xl">{tutorName(tutor)}</CardTitle>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Globe2 className="size-4" />{tutor.country || t("countryUnknown")}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 min-h-20 text-sm leading-7 text-muted-foreground">{tutor.bio || t("bioFallback")}</p>
                    <div className="mt-5 flex min-h-7 flex-wrap gap-2">
                      {tutor.subjects.slice(0, 3).map((subject) => <Badge key={subject} variant="secondary">{subject}</Badge>)}
                    </div>
                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                      <Button asChild className="rounded-xl"><Link href={`/${locale}/tutors/${tutor.id}`}>{t("viewProfile")}<ArrowUpRight aria-hidden="true" /></Link></Button>
                      {tutor.intro_video_url || tutor.intro_video_file ? <Button asChild variant="outline" className="rounded-xl"><a href={tutor.intro_video_url || tutor.intro_video_file || "#"} target="_blank" rel="noreferrer"><Video aria-hidden="true" />{t("introVideo")}</a></Button> : <Button variant="outline" className="rounded-xl" disabled><Video aria-hidden="true" />{t("introVideo")}</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
