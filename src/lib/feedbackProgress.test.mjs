import assert from "node:assert/strict";
import test from "node:test";
import { feedbackEventProgress, feedbackProgressCaption, feedbackSummaryTotals, participantCompletion } from "./feedbackProgress.mjs";

test("a partial review is labeled in progress", () => {
  assert.equal(
    feedbackProgressCaption({ totalParticipants: 2, fullySubmittedCount: 0, partialCount: 1, notStartedCount: 1 }),
    "1 not started · 1 in progress"
  );
});

test("a person with nothing to review is not shown as finished", () => {
  assert.deepEqual(participantCompletion(0, 0, 100), { label: "No reviews", finished: false, percent: null });
  assert.equal(participantCompletion(2, 2, 100).finished, true);
  assert.equal(participantCompletion(2, 1, 50).finished, false);
});

test("an event with nothing to review is not shown as finished", () => {
  assert.deepEqual(
    feedbackEventProgress({
      totalParticipants: 2,
      fullySubmittedCount: 2,
      participants: [{ requiredCount: 0 }, { requiredCount: 0 }],
    }),
    { percent: null, completeCountLabel: "No reviews to give", barLabel: "No reviews to give" }
  );
  assert.equal(
    feedbackEventProgress({
      totalParticipants: 2,
      fullySubmittedCount: 1,
      participants: [{ requiredCount: 1 }, { requiredCount: 1 }],
    }).percent,
    50
  );
});

test("events with nothing to review do not raise the completion rate", () => {
  const totals = feedbackSummaryTotals([
    {
      totalParticipants: 2,
      fullySubmittedCount: 2,
      participants: [{ requiredCount: 0 }, { requiredCount: 0 }],
    },
    {
      totalParticipants: 2,
      fullySubmittedCount: 1,
      partialCount: 0,
      notStartedCount: 1,
      participants: [{ requiredCount: 1 }, { requiredCount: 1 }],
    },
  ]);
  assert.equal(totals.participants, 4);
  assert.equal(totals.submitted, 1);
  assert.equal(totals.pending, 1);
  assert.equal(totals.percent, 50);
  assert.equal(feedbackSummaryTotals([{
    totalParticipants: 2,
    fullySubmittedCount: 2,
    participants: [{ requiredCount: 0 }, { requiredCount: 0 }],
  }]).percent, null);
});

test("an untouched roster stays pending", () => {
  assert.equal(
    feedbackProgressCaption({ totalParticipants: 4, fullySubmittedCount: 1, partialCount: 0, notStartedCount: 3 }),
    "3 pending"
  );
});
