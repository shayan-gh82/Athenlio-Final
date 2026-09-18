export const courseSortValues = ["recommended", "title", "price-asc", "price-desc"] as const;

export type CourseSort = (typeof courseSortValues)[number];

export interface CourseCatalogFilters {
  q: string;
  language: string;
  level: string;
  day: string;
  sort: CourseSort;
}

type SearchParamValue = string | string[] | undefined;

function first(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export function parseCourseCatalogFilters(params: Record<string, SearchParamValue>): CourseCatalogFilters {
  const sort = first(params.sort);
  return {
    q: first(params.q).trim().slice(0, 100),
    language: first(params.language).trim().slice(0, 60),
    level: first(params.level).trim().slice(0, 60),
    day: first(params.day).trim().slice(0, 60),
    sort: courseSortValues.includes(sort as CourseSort) ? sort as CourseSort : "recommended",
  };
}

export function courseFiltersToSearchParams(filters: CourseCatalogFilters) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.language) params.set("language", filters.language);
  if (filters.level) params.set("level", filters.level);
  if (filters.day) params.set("day", filters.day);
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  return params;
}
