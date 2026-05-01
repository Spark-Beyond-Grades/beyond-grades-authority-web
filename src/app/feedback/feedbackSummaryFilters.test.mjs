import test from "node:test";
import assert from "node:assert/strict";

import { getTrackableFeedbackSummaries } from "./feedbackSummaryFilters.mjs";

test("removes event-only summaries with no uploaded participants", () => {
  const eventOnlySummary = {
    event: { _id: "event-only", name: "Guest Lecture" },
    totalParticipants: 0,
    participants: [],
  };
  const feedbackSummary = {
    event: { _id: "feedback-event", name: "Tech Fest" },
    totalParticipants: 2,
    participants: [{ email: "a@example.com" }, { email: "b@example.com" }],
  };

  assert.deepEqual(
    getTrackableFeedbackSummaries([eventOnlySummary, feedbackSummary]),
    [feedbackSummary]
  );
});

test("keeps summaries whose participant list exists even if total count is missing", () => {
  const feedbackSummary = {
    event: { _id: "feedback-event", name: "Tech Fest" },
    participants: [{ email: "a@example.com" }],
  };

  assert.deepEqual(getTrackableFeedbackSummaries([feedbackSummary]), [feedbackSummary]);
});
