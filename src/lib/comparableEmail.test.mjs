import test from "node:test";
import assert from "node:assert/strict";
import { comparableEmail, ratedTargetSet } from "./comparableEmail.mjs";

test("a finished review matches a roster email that differs by case or spacing", () => {
  const rated = ratedTargetSet([{ email: "ada@uni.edu" }, { email: null }]);
  assert.equal(rated.has(comparableEmail("Ada@Uni.edu ")), true);
  assert.equal(comparableEmail("Ada\u00A0@Uni.edu"), comparableEmail("ada@uni.edu"));
  assert.equal(rated.has(comparableEmail("ben@uni.edu")), false);
});
