export function feedbackSummaryTotals(summaries = []) {
  const totals = { events: 0, participants: 0, submitted: 0, pending: 0, partial: 0, reviewable: 0 };
  for (const summary of summaries || []) {
    totals.events += 1;
    const people = Array.isArray(summary?.participants) ? summary.participants : [];
    const participantCount = Number(summary?.totalParticipants) || 0;
    totals.participants += participantCount;
    const noReviews = people.length > 0 && people.every((person) => !Number(person?.requiredCount));
    if (noReviews) continue;
    totals.reviewable += participantCount;
    totals.submitted += Number(summary?.fullySubmittedCount) || 0;
    totals.partial += Number(summary?.partialCount) || 0;
    totals.pending += summary?.notStartedCount == null
      ? Math.max(participantCount - (Number(summary?.fullySubmittedCount) || 0) - (Number(summary?.partialCount) || 0), 0)
      : Number(summary.notStartedCount) || 0;
  }
  return {
    ...totals,
    percent: totals.reviewable > 0 ? Math.round((totals.submitted / totals.reviewable) * 100) : null,
  };
}

export function participantCompletion(required, given = 0, pct = 0) {
  if (!Number(required)) return { label: "No reviews", finished: false, percent: null };
  const percent = Number(pct) || 0;
  return { label: `${Number(given) || 0}/${Number(required)}`, finished: percent === 100, percent };
}

export function feedbackEventProgress(summary = {}) {
  const participants = Array.isArray(summary.participants) ? summary.participants : [];
  const total = Number(summary.totalParticipants) || 0;
  const noReviews = total > 0 && participants.length > 0 && participants.every((person) => !Number(person?.requiredCount));
  if (noReviews) {
    return { percent: null, completeCountLabel: "No reviews to give", barLabel: "No reviews to give" };
  }
  const fully = Number(summary.fullySubmittedCount) || 0;
  const percent = total > 0 ? Math.round((fully / total) * 100) : 0;
  return { percent, completeCountLabel: `${fully} Complete`, barLabel: `${fully} fully complete` };
}

export function feedbackProgressCaption({ totalParticipants = 0, fullySubmittedCount = 0, partialCount = 0, notStartedCount } = {}) {
  const partial = Number(partialCount) || 0;
  const notStarted = notStartedCount == null
    ? Math.max(Number(totalParticipants) - Number(fullySubmittedCount) - partial, 0)
    : Number(notStartedCount) || 0;
  if (partial > 0) return `${notStarted} not started · ${partial} in progress`;
  const pending = notStartedCount == null
    ? Math.max(Number(totalParticipants) - Number(fullySubmittedCount), 0)
    : notStarted;
  return `${pending} pending`;
}
