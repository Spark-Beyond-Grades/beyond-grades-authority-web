export function formatFiniteScore(score) {
  if (typeof score !== "number" || !Number.isFinite(score)) return null;
  return score.toFixed(1);
}

export function ratingScale(min, max) {
  if (min == null || max == null || min === "" || max === "") return "";
  const low = Number(min);
  const high = Number(max);
  if (!Number.isFinite(low) || !Number.isFinite(high) || high <= low) return "";
  return ` on ${scaleBound(low)}–${scaleBound(high)}`;
}

function scaleBound(value) {
  return value % 1 === 0 ? String(value) : String(value);
}
