import assert from "node:assert/strict";
import test from "node:test";

import { courseFiltersToSearchParams, parseCourseCatalogFilters } from "../features/courses/catalog-filters.ts";

test("parses and serializes supported course filters", () => {
  const filters = parseCourseCatalogFilters({ q: "  IELTS  ", language: "English", level: "B2", day: "Monday", sort: "price-asc" });
  assert.deepEqual(filters, { q: "IELTS", language: "English", level: "B2", day: "Monday", sort: "price-asc" });
  assert.equal(courseFiltersToSearchParams(filters).toString(), "q=IELTS&language=English&level=B2&day=Monday&sort=price-asc");
});

test("drops unsupported sorting and empty filter values", () => {
  const filters = parseCourseCatalogFilters({ q: "", language: "", sort: "newest" });
  assert.deepEqual(filters, { q: "", language: "", level: "", day: "", sort: "recommended" });
  assert.equal(courseFiltersToSearchParams(filters).toString(), "");
});

test("uses the first value and limits user-controlled filter length", () => {
  const filters = parseCourseCatalogFilters({ q: ["a".repeat(150), "ignored"], language: ["German", "English"] });
  assert.equal(filters.q.length, 100);
  assert.equal(filters.language, "German");
});
