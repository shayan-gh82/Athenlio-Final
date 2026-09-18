import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const rootUrl = new URL("..", import.meta.url);

test("uses sparse star layers instead of the old dot grid", async () => {
  const css = await readFile(new URL("app/globals.css", rootUrl), "utf8");

  assert.match(css, /content:\s*"✦"/);
  assert.match(css, /@keyframes athenlio-stars-twinkle/);
  assert.match(css, /@keyframes athenlio-stars-breathe/);
  assert.doesNotMatch(css, /background-size:\s*[^;]*24px 24px/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("publishes bilingual SEO routes and protects private surfaces", async () => {
  const [robots, sitemap, seoConfig, rootLayout] = await Promise.all([
    readFile(new URL("app/robots.ts", rootUrl), "utf8"),
    readFile(new URL("app/sitemap.ts", rootUrl), "utf8"),
    readFile(new URL("lib/seo/site.ts", rootUrl), "utf8"),
    readFile(new URL("app/layout.tsx", rootUrl), "utf8"),
  ]);

  assert.match(robots, /dashboard/);
  assert.match(robots, /register/);
  assert.match(sitemap, /publicRoutes/);
  assert.match(seoConfig, /"x-default"/);
  assert.match(seoConfig, /index:\s*false/);
  assert.match(rootLayout, /location\.pathname\.startsWith\("\/en\/"\)/);
  assert.match(rootLayout, /document\.documentElement\.dir/);
});
