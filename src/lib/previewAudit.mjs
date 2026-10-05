const LABELS = {
  not_eligible: "Not eligible",
  not_configured: "Setup incomplete",
  collecting: "Collecting",
  provisional: "Provisional",
  recalculation_required: "Recalculation required",
};

function hasNumericScore(preview) {
  return (preview.participants || []).some((person) => typeof person?.eventScore === "number" && Number.isFinite(person.eventScore));
}

export function previewAuditLabel(preview, closed = false) {
  if (!preview || typeof preview !== "object") return null;
  if (preview.auditStatus === "not_eligible" || preview.eligible === false) return LABELS.not_eligible;
  if (preview.auditStatus === "not_configured" || preview.configured === false) return LABELS.not_configured;
  if (preview.auditStatus === "recalculation_required") return LABELS.recalculation_required;
  if (preview.auditStatus === "final" || closed) return hasNumericScore(preview) ? "Final" : "Closed";
  if (preview.auditStatus === "provisional" || (preview.participants || []).some((person) => person?.status === "PROVISIONAL")) {
    return LABELS.provisional;
  }
  return LABELS.collecting;
}

export function snapshotSavedLabel(value, timeZone = "UTC") {
  const raw = String(value || "").trim();
  const date = new Date(raw);
  if (!raw || Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).formatToParts(date);
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  const year = parts.find((part) => part.type === "year")?.value;
  return month && day && year ? `Snapshot saved ${month} ${day}, ${year}` : "";
}
