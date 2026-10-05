import { formatFiniteScore, ratingScale } from "./ratingScale.mjs";

export function scoreReason(reason) {
  const labels = {
    missing_settings: "Scoring setup is incomplete",
    no_ratings: "No peer ratings yet",
    unscored_skill: "A skill has no ratings, so this event has no EPA",
    zero_weight: "The organizer's weights leave this score empty",
    zero_skill_weight: "The organizer's weights leave this score empty",
    not_eligible: "This event is not included in scoring",
    below_minimum_ratings: "Provisional — more feedback is needed",
  };
  return labels[reason] || "No score";
}

export function confidencePercent(confidence) {
  if (typeof confidence !== "number" || !Number.isFinite(confidence)) return null;
  return Math.round(confidence * 100);
}

export function previewEventScoreLine(score, scaleMin, scaleMax, reason, status) {
  const shown = formatFiniteScore(score);
  if (shown == null) return scoreReason(reason);
  return `${shown}${ratingScale(scaleMin, scaleMax)}${status === "PROVISIONAL" ? " · provisional" : ""}`;
}

export function previewSkillScoreLine(skill, score, scaleMin, scaleMax, reason, confidence) {
  const shown = formatFiniteScore(score);
  const body = shown == null ? scoreReason(reason) : `${shown}${ratingScale(scaleMin, scaleMax)}`;
  const percent = confidencePercent(confidence);
  return `${skill}: ${body}${percent == null ? "" : ` · ${percent}% confidence`}`;
}

export function previewConfidenceLabel(confidence) {
  const percent = confidencePercent(confidence);
  return percent == null ? null : `Confidence ${percent}%`;
}
