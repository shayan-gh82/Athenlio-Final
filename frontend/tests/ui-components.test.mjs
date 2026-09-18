import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const rootUrl = new URL("..", import.meta.url);

test("keeps accessible progress semantics", async () => {
  const source = await readFile(new URL("components/ui/progress.tsx", rootUrl), "utf8");
  assert.match(source, /aria-valuenow/);
  assert.match(source, /aria-valuetext/);
});

test("renders sidebar skeletons deterministically", async () => {
  const source = await readFile(new URL("components/ui/sidebar.tsx", rootUrl), "utf8");
  assert.match(source, /--skeleton-width/);
  assert.doesNotMatch(source, /Math\.random/);
});

test("includes responsive and reduced-motion styling", async () => {
  const css = await readFile(new URL("app/globals.css", rootUrl), "utf8");
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /scrollbar-width/);
});
