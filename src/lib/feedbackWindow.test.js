const test = require("node:test");
const assert = require("node:assert/strict");
const { feedbackWindowLabel } = require("./feedbackWindow");

const now = new Date("2026-05-01T12:00:00.000Z");

test("feedback window label follows the saved open and close times", () => {
  assert.equal(feedbackWindowLabel({ isClosed: true, now }), "Feedback is closed");
  assert.equal(
    feedbackWindowLabel({ isClosed: false, openAt: "2026-05-02T12:00:00.000Z", now }),
    "Feedback is not open yet"
  );
  assert.equal(
    feedbackWindowLabel({ isClosed: false, closeAtTentative: "2026-04-01T12:00:00.000Z", now }),
    "Late reviews are not decided yet"
  );
  assert.equal(
    feedbackWindowLabel({
      isClosed: false,
      closeAtTentative: "2026-04-01T12:00:00.000Z",
      lateSubmissions: "reject",
      now,
    }),
    "Feedback is closed"
  );
  assert.equal(
    feedbackWindowLabel({
      isClosed: false,
      closeAtTentative: "2026-04-01T12:00:00.000Z",
      lateSubmissions: "allow",
      now,
    }),
    "Late feedback is allowed"
  );
  assert.equal(feedbackWindowLabel({ isClosed: false, now }), "Feedback is open");
});
