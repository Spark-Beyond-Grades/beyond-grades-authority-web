import test from "node:test";
import assert from "node:assert/strict";
import { previewConfidenceLabel, previewEventScoreLine, previewSkillScoreLine } from "./previewScore.mjs";

const onePeerConfidence = 1 / 6;

test("one peer rating of 8 on a 1 to 10 scale uses the shared display", () => {
  assert.equal(previewEventScoreLine(8, 1, 10, null, "READY"), "8.0 on 1–10");
  assert.equal(previewConfidenceLabel(onePeerConfidence), "Confidence 17%");
  assert.equal(
    previewSkillScoreLine("Planning", 8, 1, 10, null, onePeerConfidence),
    "Planning: 8.0 on 1–10 · 17% confidence"
  );
});

test("a missing preview score is not shown as zero", () => {
  const line = previewSkillScoreLine("Planning", null, 1, 10, "no_ratings", null);
  assert.equal(line, "Planning: No peer ratings yet");
  assert.equal(line.includes("0.0"), false);
  assert.equal(previewEventScoreLine(null, 1, 10, "no_ratings", "NO_DATA"), "No peer ratings yet");
  assert.equal(previewConfidenceLabel(null), null);
});

test("a real zero preview score stays visible", () => {
  assert.equal(previewEventScoreLine(0, 1, 10, null, "READY"), "0.0 on 1–10");
  assert.equal(previewSkillScoreLine("Planning", 0, 1, 10, null, 0), "Planning: 0.0 on 1–10 · 0% confidence");
});
