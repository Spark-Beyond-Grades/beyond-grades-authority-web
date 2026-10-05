export function contributesToScoringChoice(value) {
  if (value === "yes") return "Yes, score this event";
  if (value === "no") return "No, keep skill scores but leave this event out of overall EPA";
  return "";
}
