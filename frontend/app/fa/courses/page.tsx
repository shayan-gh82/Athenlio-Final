import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { courseFiltersToSearchParams, parseCourseCatalogFilters } from "@/features/courses/catalog-filters";
import { CourseCatalog } from "@/features/courses/components/course-catalog";
import { localeAlternates } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "دوره‌های آموزش زبان",
  description: "دوره‌های زبان را براساس زبان، سطح، زمان برگزاری و هزینه مقایسه کن.",
  alternates: localeAlternates("fa", "/courses"),
};

export default async function PersianCoursesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseCourseCatalogFilters(await searchParams);
  return <LocaleProvider locale="fa"><CourseCatalog key={courseFiltersToSearchParams(filters).toString()} initialFilters={filters} /></LocaleProvider>;
}
