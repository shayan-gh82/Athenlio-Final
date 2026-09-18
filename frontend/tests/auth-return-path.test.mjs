import assert from "node:assert/strict";
import test from "node:test";

import { getSafeReturnPath, withReturnPath } from "../lib/auth/return-path.ts";

test("keeps a same-locale internal return path", () => {
  assert.equal(getSafeReturnPath("/fa/courses/42?enroll=1", "fa"), "/fa/courses/42?enroll=1");
  assert.equal(withReturnPath("/fa/login", "/fa/courses/42?enroll=1"), "/fa/login?next=%2Ffa%2Fcourses%2F42%3Fenroll%3D1");
});

test("rejects external, cross-locale and auth-loop return paths", () => {
  assert.equal(getSafeReturnPath("https://evil.example/steal", "fa"), null);
  assert.equal(getSafeReturnPath("//evil.example/steal", "fa"), null);
  assert.equal(getSafeReturnPath("/en/courses/42", "fa"), null);
  assert.equal(getSafeReturnPath("/fa/login", "fa"), null);
  assert.equal(getSafeReturnPath("/fa/register?next=/fa/login", "fa"), null);
});
