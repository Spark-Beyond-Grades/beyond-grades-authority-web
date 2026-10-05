const test = require("node:test");
const assert = require("node:assert/strict");
const { toDateTimeLocal, toIsoDateTime } = require("./dateTimeLocal");

test("event form dates round-trip in local time", () => {
  const original = new Date("2026-05-01T09:00:00.000Z");
  const local = toDateTimeLocal(original.toISOString());
  assert.equal(new Date(local).toISOString(), original.toISOString());
  assert.equal(toDateTimeLocal(""), "");
  assert.equal(toDateTimeLocal("not-a-date"), "");
  assert.equal(toIsoDateTime(""), null);
  assert.equal(toIsoDateTime("2026-05-01T09:00"), new Date("2026-05-01T09:00").toISOString());
  assert.throws(() => toIsoDateTime("not-a-date"), /Enter a valid date and time/);
  assert.throws(() => toIsoDateTime("2026-02-31T09:00"), /Enter a valid date and time/);
});
