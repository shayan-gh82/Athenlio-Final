import test from "node:test";
import assert from "node:assert/strict";
import { demoCatalog, resolveDemoRead } from "../lib/demo/catalog.ts";

test("demo courses link to approved tutors and have distinct localized titles", () => {
  const fa = demoCatalog("fa"), en = demoCatalog("en");
  assert.equal(fa.courses.length, 4);
  for (const course of fa.courses) assert.ok(fa.tutors.some(t => t.id === course.tutor.id && t.is_approved));
  assert.notEqual(fa.courses[0].title, en.courses[0].title);
});
test("demo provides known public records only, never account or payment endpoints", () => {
  assert.equal(resolveDemoRead("/api/courses/1/", "en").id, 1);
  for (const path of ["/api/courses/9999/", "/api/me/", "/api/login/", "/api/enrollments/"]) {
    assert.equal(resolveDemoRead(path, "en"), undefined);
  }
});
