import type { Metadata } from "next";

import { LocaleProvider } from "@/components/providers/locale-experience";
import { courseFiltersToSearchParams, parseCourseCatalogFilters } from "@/features/courses/catalog-filters";
import { CourseCatalog } from "@/features/courses/components/course-catalog";
import { localeAlternates } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Language courses",
  description: "Compare language courses by language, level, schedule and price.",
  alternates: localeAlternates("en", "/courses"),
};

export default async function EnglishCoursesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseCourseCatalogFilters(await searchParams);
  return <LocaleProvider locale="en"><CourseCatalog key={courseFiltersToSearchParams(filters).toString()} initialFilters={filters} /></LocaleProvider>;
}
