"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarDays, Clock3, Filter, RotateCcw, Search, SlidersHorizontal, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CatalogLoading, CatalogState } from "@/features/catalog/components/catalog-state";
import { AddToCartButton } from "@/features/cart/components/cart-button";
import { courseFiltersToSearchParams, type CourseCatalogFilters, type CourseSort } from "@/features/courses/catalog-filters";
import type { Course } from "@/features/courses/types";
import { apiClient } from "@/lib/api/client";
import { unwrapCollection, type PaginatedResponse } from "@/lib/api/collections";
import { isCatalogAvailable } from "@/lib/api/config";
import { endpoints } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/keys";
import { replaceLocationSearch } from "@/hooks/use-location-search";

const emptyFilters: CourseCatalogFilters = { q: "", language: "", level: "", day: "", sort: "recommended" };

function coursePrice(course: Course) {
  const dollar = Number(course.price_per_dollar ?? course.price_per_hour ?? 0);
  const toman = Number(course.price_per_toman ?? 0);
  return dollar > 0 ? { amount: dollar, currency: "USD" } : toman > 0 ? { amount: toman, currency: "TOMAN" } : null;
}

function tutorName(course: Course, fallback: string) {
  if (!course.tutor || typeof course.tutor.user !== "object") return fallback;
  return `${course.tutor.user.first_name ?? ""} ${course.tutor.user.last_name ?? ""}`.trim() || fallback;
}

export function CourseCatalog({ initialFilters }: { initialFilters: CourseCatalogFilters }) {
  const t = useTranslations("courseCatalog");
  const locale = useLocale();
  const pathname = usePathname();
  const [filters, setFilters] = useState(initialFilters);
  const [draftSearch, setDraftSearch] = useState(initialFilters.q);
  const initialQuery = courseFiltersToSearchParams(initialFilters).toString();
  const query = useQuery({
    queryKey: [...queryKeys.courseList, locale],
    queryFn: async () => {
      const response = await apiClient.get<Course[] | PaginatedResponse<Course>>(endpoints.courses.list, { headers: { "X-Demo-Locale": locale } });
      return unwrapCollection(response.data);
    },
    enabled: isCatalogAvailable,
    staleTime: 3 * 60_000,
  });

  const options = useMemo(() => {
    const courses = query.data ?? [];
    const unique = (values: string[]) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, locale));
    return {
      languages: unique([filters.language, ...courses.map((course) => course.language)]),
      levels: unique([filters.level, ...courses.map((course) => course.level)]),
      days: unique([filters.day, ...courses.map((course) => course.schedule_day)]),
    };
  }, [filters.day, filters.language, filters.level, locale, query.data]);

  const filteredCourses = useMemo(() => {
    const term = filters.q.toLocaleLowerCase(locale);
    const courses = (query.data ?? []).filter((course) => {
      const searchable = [course.title, course.description, course.language, course.level, tutorName(course, "")].join(" ").toLocaleLowerCase(locale);
      return (!term || searchable.includes(term))
        && (!filters.language || course.language === filters.language)
        && (!filters.level || course.level === filters.level)
        && (!filters.day || course.schedule_day === filters.day);
    });
    const collator = new Intl.Collator(locale, { numeric: true, sensitivity: "base" });
    if (filters.sort === "title") return [...courses].sort((a, b) => collator.compare(a.title, b.title));
    if (filters.sort === "price-asc") return [...courses].sort((a, b) => (coursePrice(a)?.amount ?? Number.MAX_SAFE_INTEGER) - (coursePrice(b)?.amount ?? Number.MAX_SAFE_INTEGER));
    if (filters.sort === "price-desc") return [...courses].sort((a, b) => (coursePrice(b)?.amount ?? -1) - (coursePrice(a)?.amount ?? -1));
    return courses;
  }, [filters, locale, query.data]);

  const activeFilterCount = [filters.q, filters.language, filters.level, filters.day].filter(Boolean).length;

  const commitFilters = (next: CourseCatalogFilters) => {
    setFilters(next);
    replaceLocationSearch(pathname, courseFiltersToSearchParams(next));
  };

  const updateFilter = (key: "language" | "level" | "day" | "sort", value: string) => {
    commitFilters({ ...filters, [key]: value } as CourseCatalogFilters);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    commitFilters({ ...filters, q: draftSearch.trim().slice(0, 100) });
  };

  const clearFilters = () => {
    setDraftSearch("");
    commitFilters(emptyFilters);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader initialSearch={initialQuery ? `?${initialQuery}` : ""} />
      <main className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <p className="text-sm font-bold text-secondary">{t("eyebrow")}</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{t("description")}</p>
          </div>
          <form onSubmit={submitSearch} className="flex w-full gap-2 lg:w-[410px]" role="search">
            <Input aria-label={t("searchAction")} value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder={t("searchPlaceholder")} className="h-12 rounded-xl bg-card" />
            <Button type="submit" size="icon" className="size-12 shrink-0 rounded-xl" aria-label={t("searchAction")}><Search aria-hidden="true" /></Button>
          </form>
        </div>

        <section className="mt-8 rounded-3xl border border-primary/10 bg-card/72 p-4 shadow-sm backdrop-blur sm:p-5" aria-label={t("filtersTitle")}>
          <div className="hidden items-end gap-4 lg:grid lg:grid-cols-[1fr_1fr_1fr_1.2fr_auto]">
            <FilterFields idPrefix="desktop" filters={filters} options={options} onChange={updateFilter} />
            <Button type="button" variant="ghost" className="h-11 rounded-xl" onClick={clearFilters} disabled={!activeFilterCount && filters.sort === "recommended"}><RotateCcw aria-hidden="true" />{t("clearFilters")}</Button>
          </div>
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <div><p className="font-bold">{t("filtersTitle")}</p><p className="mt-1 text-sm text-muted-foreground">{t("filtersMobileDescription")}</p></div>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" className="h-11 shrink-0 rounded-xl"><SlidersHorizontal aria-hidden="true" />{t("filters")}{activeFilterCount ? <Badge className="ms-1 min-w-6 justify-center px-1.5">{activeFilterCount}</Badge> : null}</Button></SheetTrigger>
              <SheetContent side={locale === "fa" ? "left" : "right"} className="w-[88%] max-w-sm">
                <SheetHeader className="border-b border-border px-5 py-6 text-start"><SheetTitle>{t("filtersTitle")}</SheetTitle><SheetDescription>{t("filtersDescription")}</SheetDescription></SheetHeader>
                <div className="grid gap-5 overflow-y-auto px-5 py-3"><FilterFields idPrefix="mobile" filters={filters} options={options} onChange={updateFilter} /></div>
                <SheetFooter className="border-t border-border p-5"><SheetClose asChild><Button className="h-11 rounded-xl">{t("showResults", { count: filteredCourses.length })}</Button></SheetClose><Button type="button" variant="ghost" className="h-11 rounded-xl" onClick={clearFilters}><RotateCcw aria-hidden="true" />{t("clearFilters")}</Button></SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </section>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">{query.isSuccess ? t("resultCount", { count: filteredCourses.length }) : t("resultPending")}</p>
          {activeFilterCount ? <div className="flex flex-wrap gap-2">{filters.q ? <Badge variant="outline">{t("searchBadge", { value: filters.q })}</Badge> : null}{filters.language ? <Badge variant="outline">{filters.language}</Badge> : null}{filters.level ? <Badge variant="outline">{filters.level}</Badge> : null}{filters.day ? <Badge variant="outline">{filters.day}</Badge> : null}</div> : null}
        </div>

        <div className="mt-5">
          {!isCatalogAvailable ? <CatalogState kind="unconfigured" /> : null}
          {query.isLoading ? <CatalogLoading /> : null}
          {query.isError ? <CatalogState kind="error" onRetry={() => query.refetch()} /> : null}
          {query.isSuccess && filteredCourses.length === 0 ? <CourseEmptyState hasFilters={Boolean(activeFilterCount)} onClear={clearFilters} /> : null}
          {query.isSuccess && filteredCourses.length > 0 ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredCourses.map((course) => <CourseCard key={course.id} course={course} locale={locale} />)}</div> : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function FilterFields({ idPrefix, filters, options, onChange }: { idPrefix: string; filters: CourseCatalogFilters; options: { languages: string[]; levels: string[]; days: string[] }; onChange: (key: "language" | "level" | "day" | "sort", value: string) => void }) {
  const t = useTranslations("courseCatalog");
  const fields = [
    { key: "language", label: t("languageFilter"), all: t("allLanguages"), values: options.languages },
    { key: "level", label: t("levelFilter"), all: t("allLevels"), values: options.levels },
    { key: "day", label: t("dayFilter"), all: t("allDays"), values: options.days },
  ] as const;
  return <>{fields.map((field) => { const id = `${idPrefix}-course-${field.key}`; return <div key={field.key} className="space-y-2"><Label htmlFor={id}>{field.label}</Label><NativeSelect id={id} value={filters[field.key]} onChange={(event) => onChange(field.key, event.target.value)} className="h-11 w-full rounded-xl bg-background/70"><NativeSelectOption value="">{field.all}</NativeSelectOption>{field.values.map((value) => <NativeSelectOption key={value} value={value}>{value}</NativeSelectOption>)}</NativeSelect></div>; })}<div className="space-y-2"><Label htmlFor={`${idPrefix}-course-sort`}>{t("sortLabel")}</Label><NativeSelect id={`${idPrefix}-course-sort`} value={filters.sort} onChange={(event) => onChange("sort", event.target.value as CourseSort)} className="h-11 w-full rounded-xl bg-background/70"><NativeSelectOption value="recommended">{t("sortRecommended")}</NativeSelectOption><NativeSelectOption value="title">{t("sortTitle")}</NativeSelectOption><NativeSelectOption value="price-asc">{t("sortPriceLow")}</NativeSelectOption><NativeSelectOption value="price-desc">{t("sortPriceHigh")}</NativeSelectOption></NativeSelect></div></>;
}

function CourseCard({ course, locale }: { course: Course; locale: string }) {
  const t = useTranslations("courseCatalog");
  const price = coursePrice(course);
  return <Card className="group overflow-hidden border-primary/10 bg-card/90 py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/8">
    <div className="relative flex h-40 items-center justify-between overflow-hidden bg-gradient-to-br from-primary-soft to-secondary-bright/10 px-6 dark:from-primary/15">
      {course.image ? <Image src={course.image} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /> : <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md"><BookOpen aria-hidden="true" /></span>}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/65 via-transparent to-transparent" aria-hidden="true" />
      <Badge variant="outline" className="absolute end-4 top-4 border-white/35 bg-card/88 backdrop-blur">{course.level || t("levelUnknown")}</Badge>
      <p className="absolute bottom-4 start-5 text-sm font-bold text-white drop-shadow">{course.language || t("languageUnknown")}</p>
    </div>
    <CardHeader className="p-6 pb-3"><div className="flex items-start justify-between gap-3"><CardTitle className="line-clamp-2 text-xl leading-8">{course.title}</CardTitle><span className="shrink-0 text-sm font-black text-primary">{price ? `${price.amount.toLocaleString(locale)} ${price.currency}` : t("priceUnavailable")}</span></div><p className="text-sm text-muted-foreground">{t("byTutor", { name: tutorName(course, t("tutorUnknown")) })}</p></CardHeader>
    <CardContent className="p-6 pt-0"><p className="line-clamp-3 min-h-20 text-sm leading-7 text-muted-foreground">{course.description}</p><div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><CalendarDays className="size-4 shrink-0" aria-hidden="true" />{course.schedule_day || "—"}</span><span className="flex items-center gap-1.5"><Clock3 className="size-4 shrink-0" aria-hidden="true" />{course.course_duration ? t("durationMinutes", { count: course.course_duration }) : "—"}</span><span className="flex items-center gap-1.5"><Users className="size-4 shrink-0" aria-hidden="true" />{course.active_students}/{course.capacity}</span></div><div className="mt-5 grid gap-2 sm:grid-cols-2"><Button asChild variant="outline" className="rounded-xl"><Link href={`/${locale}/courses/${course.id}`}>{t("viewDetails")}</Link></Button><AddToCartButton courseId={course.id} className="rounded-xl" /></div></CardContent>
  </Card>;
}

function CourseEmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  const t = useTranslations("courseCatalog");
  return <div className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-primary/25 bg-card/65 px-6 py-12 text-center"><div className="max-w-lg"><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary dark:bg-primary/15"><Filter aria-hidden="true" /></span><h2 className="mt-5 text-xl font-bold">{t(hasFilters ? "filteredEmptyTitle" : "emptyTitle")}</h2><p className="mt-3 leading-8 text-muted-foreground">{t(hasFilters ? "filteredEmptyDescription" : "emptyDescription")}</p>{hasFilters ? <Button type="button" variant="outline" className="mt-6 rounded-xl" onClick={onClear}><RotateCcw aria-hidden="true" />{t("clearFilters")}</Button> : null}</div></div>;
}
