import test from "node:test";
import assert from "node:assert/strict";
import { previewAuditLabel, snapshotSavedLabel } from "./previewAudit.mjs";

test("a closed preview is final only when a participant has a numeric score", () => {
  assert.equal(previewAuditLabel({ auditStatus: "final", participants: [{ eventScore: 8 }] }, true), "Final");
  assert.equal(previewAuditLabel({ auditStatus: "final", participants: [{ eventScore: 0 }] }, true), "Final");
  assert.equal(previewAuditLabel({ auditStatus: "final", participants: [{ eventScore: null }] }, true), "Closed");
  assert.equal(previewAuditLabel({ auditStatus: "final", participants: [] }, true), "Closed");
  assert.equal(previewAuditLabel({ participants: [] }, true), "Closed");
  assert.equal(previewAuditLabel({ auditStatus: "collecting", participants: [{ eventScore: 8 }] }, false), "Collecting");
  assert.equal(previewAuditLabel({ auditStatus: "not_configured", participants: [] }, true), "Setup incomplete");
  assert.equal(previewAuditLabel({ eligible: false, participants: [{ eventScore: 8 }] }, true), "Not eligible");
});

test("a snapshot date uses the freeze time", () => {
  assert.equal(snapshotSavedLabel("2026-03-01T12:00:00.000Z", "UTC"), "Snapshot saved Mar 1, 2026");
  assert.equal(snapshotSavedLabel("", "UTC"), "");
  assert.equal(snapshotSavedLabel(null, "UTC"), "");
});
