export function coverageSentence(coverage) {
  if (!coverage) return null;
  if (coverage.countable === false) return "No reviews to give. This count is not an EPA score.";
  const count = Number(coverage.submittedReviews);
  const submitted = Number.isFinite(count) ? count : 0;
  const noun = submitted === 1 ? "review" : "reviews";
  const possible = coverage.expectedReviews == null ? "" : ` of ${coverage.expectedReviews} possible`;
  return `Response coverage: ${submitted} submitted ${noun}${possible}. This count is not an EPA score.`;
}
