export function getTrackableFeedbackSummaries(summaries) {
  if (!Array.isArray(summaries)) return [];

  return summaries.filter((summary) => {
    const participantCount = Array.isArray(summary?.participants)
      ? summary.participants.length
      : Number(summary?.totalParticipants || 0);

    return participantCount > 0;
  });
}
