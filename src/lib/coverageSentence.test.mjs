import test from "node:test";
import assert from "node:assert/strict";
import { coverageSentence } from "./coverageSentence.mjs";

test("an event with no skills does not look like missed reviews", () => {
  assert.equal(
    coverageSentence({ submittedReviews: 0, expectedReviews: null, countable: false }),
    "No reviews to give. This count is not an EPA score."
  );
});

test("a counted review names the possible total when it is known", () => {
  assert.equal(
    coverageSentence({ submittedReviews: 1, expectedReviews: 2, countable: true }),
    "Response coverage: 1 submitted review of 2 possible. This count is not an EPA score."
  );
  assert.equal(
    coverageSentence({ submittedReviews: 0, expectedReviews: null, countable: true }),
    "Response coverage: 0 submitted reviews. This count is not an EPA score."
  );
});
