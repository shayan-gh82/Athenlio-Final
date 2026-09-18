import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

const { normalizeLanguagesSpoken, normalizeStringList } =
  await vite.ssrLoadModule("/features/tutors/normalize.ts");

test("normalizes legacy tutor language formats", () => {
  assert.deepEqual(normalizeLanguagesSpoken("English"), [
    { language: "English", level: "" },
  ]);
  assert.deepEqual(normalizeLanguagesSpoken(["English", "Spanish"]), [
    { language: "English", level: "" },
    { language: "Spanish", level: "" },
  ]);
  assert.deepEqual(
    normalizeLanguagesSpoken('[{"language":"German","level":"B2"}]'),
    [{ language: "German", level: "B2" }],
  );
  assert.deepEqual(normalizeLanguagesSpoken(null), []);
});

test("normalizes serialized and comma-separated subjects", () => {
  assert.deepEqual(normalizeStringList('["IELTS","Conversation"]'), [
    "IELTS",
    "Conversation",
  ]);
  assert.deepEqual(normalizeStringList("Grammar, Speaking"), [
    "Grammar",
    "Speaking",
  ]);
});
