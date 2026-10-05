export function comparableEmail(value) {
  return String(value || "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\u00A0/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

export function ratedTargetSet(targets) {
  return new Set((targets || []).map((target) => comparableEmail(target?.email)));
}
