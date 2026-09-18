import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const rootUrl = new URL("..", import.meta.url);

test("keeps required bilingual dashboard translation keys", async () => {
  const [fa, en] = await Promise.all([
    readFile(new URL("messages/fa.json", rootUrl), "utf8").then(JSON.parse),
    readFile(new URL("messages/en.json", rootUrl), "utf8").then(JSON.parse),
  ]);
  const dashboardKeys = ["myCourses", "purchases", "assignments", "cart", "courseCatalog"];
  for (const messages of [fa, en]) {
    assert.equal(typeof messages.tutorDashboard.manageCourses, "string");
    for (const key of dashboardKeys) assert.equal(typeof messages.dashboardShell[key], "string");
  }
});

test("publishes cart, purchases and student course pages in both locales", async () => {
  const paths = [
    "app/fa/cart/page.tsx", "app/en/cart/page.tsx",
    "app/fa/dashboard/student/courses/page.tsx", "app/en/dashboard/student/courses/page.tsx",
    "app/fa/dashboard/student/purchases/page.tsx", "app/en/dashboard/student/purchases/page.tsx",
  ];
  const sources = await Promise.all(paths.map((path) => readFile(new URL(path, rootUrl), "utf8")));
  sources.forEach((source) => assert.match(source, /LocaleProvider/));
});
