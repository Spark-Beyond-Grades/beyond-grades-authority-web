function feedbackWindowLabel({ isClosed, openAt, closeAtTentative, lateSubmissions, now = new Date() }) {
  if (isClosed) return "Feedback is closed";
  const current = now.getTime();
  const opens = openAt ? new Date(openAt).getTime() : NaN;
  const closes = closeAtTentative ? new Date(closeAtTentative).getTime() : NaN;
  if (Number.isFinite(opens) && opens > current) return "Feedback is not open yet";
  if (Number.isFinite(closes) && closes < current && lateSubmissions === "reject") return "Feedback is closed";
  if (Number.isFinite(closes) && closes < current && lateSubmissions !== "allow") return "Late reviews are not decided yet";
  if (Number.isFinite(closes) && closes < current) return "Late feedback is allowed";
  return "Feedback is open";
}

module.exports = { feedbackWindowLabel };
