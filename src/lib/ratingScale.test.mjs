import test from "node:test";
import assert from "node:assert/strict";
import { formatFiniteScore, ratingScale } from "./ratingScale.mjs";

test("a whole-number scale drops the decimal", () => {
  assert.equal(ratingScale(1, 10), " on 1–10");
  assert.equal(ratingScale(1.5, 5.5), " on 1.5–5.5");
  assert.equal(ratingScale(1, 1), "");
  assert.equal(ratingScale(null, 10), "");
});

test("a missing preview score is not shown as zero", () => {
  assert.equal(formatFiniteScore(null), null);
  assert.equal(formatFiniteScore(""), null);
  assert.equal(formatFiniteScore(0), "0.0");
  assert.equal(formatFiniteScore(8), "8.0");
});
