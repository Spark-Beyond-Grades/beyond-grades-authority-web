import test from "node:test";
import assert from "node:assert/strict";
import { contributesToScoringChoice } from "./scoringChoices.mjs";

test("leaving an event out of overall EPA still describes the skill scores", () => {
  assert.equal(contributesToScoringChoice("yes"), "Yes, score this event");
  assert.equal(
    contributesToScoringChoice("no"),
    "No, keep skill scores but leave this event out of overall EPA"
  );
});
