import test from "node:test";
import assert from "node:assert/strict";
import { csvFileFromList, participantUploadPlan } from "./saveBeforeUpload.mjs";

test("a draft saves the team structure before a participant CSV is checked", () => {
  assert.deepEqual(participantUploadPlan(true), { saveFormFirst: true });
  assert.deepEqual(participantUploadPlan(false), { saveFormFirst: false });
});

test("a dropped CSV is read from the drop list", () => {
  const file = { name: "people.csv" };
  assert.equal(csvFileFromList([file]), file);
  assert.equal(csvFileFromList([]), null);
  assert.equal(csvFileFromList(null), null);
});
