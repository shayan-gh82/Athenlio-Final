import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const rootUrl = new URL("..", import.meta.url);

test("renders a bilingual Next.js production home page", async () => {
  const [persian, english] = await Promise.all([
    readFile(new URL(".next/server/app/fa.html", rootUrl), "utf8"),
    readFile(new URL(".next/server/app/en.html", rootUrl), "utf8"),
  ]);

  assert.match(persian, /<html[^>]+lang="fa"[^>]+dir="rtl"/i);
  assert.match(english, /<div[^>]+lang="en"[^>]+dir="ltr"/i);
  assert.match(persian, /Athenlio/);
  assert.match(english, /Athenlio/);
});
