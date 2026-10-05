"use client";

import { contributesToScoringChoice } from "@/lib/scoringChoices.mjs";

const RULES = [
  ["evenMedianRule", "Even number of ratings", [["average", "Average the two middle ratings"], ["lower", "Use the lower middle rating"], ["higher", "Use the higher middle rating"]]],
  ["blankSkillPolicy", "Blank or skipped skill", [["ignoreSkill", "Ignore that skill for that rater"], ["ignorePair", "Ignore the whole review"]]],
  ["unscoredSkillPolicy", "Skill with no ratings", [["exclude", "Leave it out of event EPA"], ["block", "Block event EPA"]]],
];

function Field({ label, value, onChange, disabled }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-brand-text">{label}</span>
      <input className="w-full rounded-lg border px-3 py-2 disabled:bg-slate-100" disabled={disabled} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export default function ScoringSettings({ levels, committees, skills, value, onChange, disabled }) {
  const config = value || {};
  const set = (patch) => onChange({ ...config, ...patch });
  const setRank = (level, rank) => set({ levelRanks: { ...(config.levelRanks || {}), [level]: rank } });
  const setWeight = (skill, weight) => set({ skillWeights: { ...(config.skillWeights || {}), [skill]: weight } });
  const setRelevance = (committee, skill, relevance) => set({
    relevance: {
      ...(config.relevance || {}),
      [committee]: { ...((config.relevance || {})[committee] || {}), [skill]: relevance },
    },
  });

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h2 className="text-lg font-semibold">Scoring</h2>
      <p className="mt-1 text-sm text-slate-500">Every value starts empty. A score is produced only after this event has all of them.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Lowest raw rating" value={config.scaleMin} disabled={disabled} onChange={(scaleMin) => set({ scaleMin })} />
        <Field label="Highest raw rating" value={config.scaleMax} disabled={disabled} onChange={(scaleMax) => set({ scaleMax })} />
        <Field label="Level influence" value={config.levelInfluence} disabled={disabled} onChange={(levelInfluence) => set({ levelInfluence })} />
        <Field label="Same-committee weight" value={config.committeeWeightSame} disabled={disabled} onChange={(committeeWeightSame) => set({ committeeWeightSame })} />
        <Field label="Top-rank weight" value={config.committeeWeightTop} disabled={disabled} onChange={(committeeWeightTop) => set({ committeeWeightTop })} />
        <Field label="Other committee weight" value={config.committeeWeightOther} disabled={disabled} onChange={(committeeWeightOther) => set({ committeeWeightOther })} />
        <Field label="Credibility constant" value={config.credibilityEpsilon} disabled={disabled} onChange={(credibilityEpsilon) => set({ credibilityEpsilon })} />
        <Field label="Credibility shrinkage" value={config.credibilityShrinkage} disabled={disabled} onChange={(credibilityShrinkage) => set({ credibilityShrinkage })} />
        <Field label="Confidence prior" value={config.confidencePrior} disabled={disabled} onChange={(confidencePrior) => set({ confidencePrior })} />
      </div>
      <div className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-900">
        Scores across events are always combined by confidence. Events with stronger feedback evidence have more influence on the overall EPA.
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {RULES.map(([key, label, options]) => (
          <label key={key} className="block text-sm">
            <span className="mb-1 block font-medium">{label}</span>
            <select className="w-full rounded-lg border px-3 py-2" disabled={disabled} value={config[key] || ""} onChange={(event) => set({ [key]: event.target.value })}>
              <option value="">Choose</option>
              {options.map(([option, text]) => <option key={option} value={option}>{text}</option>)}
            </select>
          </label>
        ))}
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Self-ratings</span>
          <select className="w-full rounded-lg border px-3 py-2" disabled={disabled} value={config.allowSelfRatings === true ? "yes" : config.allowSelfRatings === false ? "no" : ""} onChange={(event) => set({ allowSelfRatings: event.target.value === "" ? undefined : event.target.value === "yes" })}>
            <option value="">Choose</option>
            <option value="no">Do not count a person rating themselves</option>
            <option value="yes">Count self-ratings</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Include this event in EPA</span>
          <select className="w-full rounded-lg border px-3 py-2" disabled={disabled} value={config.contributesToScoring === true ? "yes" : config.contributesToScoring === false ? "no" : ""} onChange={(event) => set({ contributesToScoring: event.target.value === "" ? undefined : event.target.value === "yes" })}>
            <option value="">Choose</option>
            <option value="yes">{contributesToScoringChoice("yes")}</option>
            <option value="no">{contributesToScoringChoice("no")}</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Reviews after the planned close</span>
          <select className="w-full rounded-lg border px-3 py-2" disabled={disabled} value={config.lateSubmissions || ""} onChange={(event) => set({ lateSubmissions: event.target.value || undefined })}>
            <option value="">Choose</option>
            <option value="reject">Reject late reviews</option>
            <option value="allow">Accept late reviews</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Who reviewed whom</span>
          <select className="w-full rounded-lg border px-3 py-2" disabled={disabled} value={config.identifyRaters === true ? "yes" : config.identifyRaters === false ? "no" : ""} onChange={(event) => set({ identifyRaters: event.target.value === "" ? undefined : event.target.value === "yes" })}>
            <option value="">Choose</option>
            <option value="no">Keep reviews anonymous</option>
            <option value="yes">Show the organizer who reviewed whom</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Anonymous comments on the student dashboard</span>
          <select className="w-full rounded-lg border px-3 py-2" disabled={disabled} value={config.showComments === true ? "yes" : config.showComments === false ? "no" : ""} onChange={(event) => set({ showComments: event.target.value === "" ? undefined : event.target.value === "yes" })}>
            <option value="">Choose</option>
            <option value="yes">Show comments without the reviewer’s name</option>
            <option value="no">Hide comments</option>
          </select>
        </label>
        <Field label="Minimum reviews before a score is final (optional)" value={config.minimumRatings} disabled={disabled} onChange={(minimumRatings) => set({ minimumRatings: minimumRatings === "" ? undefined : minimumRatings })} />
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Relevance in event EPA</span>
          <select className="w-full rounded-lg border px-3 py-2" disabled={disabled} value={config.applyRelevanceToSkillWeights === true ? "yes" : config.applyRelevanceToSkillWeights === false ? "no" : ""} onChange={(event) => set({ applyRelevanceToSkillWeights: event.target.value === "" ? undefined : event.target.value === "yes" })}>
            <option value="">Choose</option>
            <option value="no">Use the skill weights typed below</option>
            <option value="yes">Use the ratee committee’s relevance as the skill weight</option>
          </select>
        </label>
      </div>
      {levels.length ? (
        <div className="mt-5">
          <h3 className="font-medium">Level ranks</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {levels.map((level) => <Field key={level} label={level} disabled={disabled} value={config.levelRanks?.[level]} onChange={(rank) => setRank(level, rank)} />)}
          </div>
        </div>
      ) : null}
      {skills.length ? (
        <div className="mt-5">
          <h3 className="font-medium">Skill weights for event EPA</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {skills.map((skill) => <Field key={skill} label={skill} disabled={disabled} value={config.skillWeights?.[skill]} onChange={(weight) => setWeight(skill, weight)} />)}
          </div>
        </div>
      ) : null}
      {committees.length && skills.length ? (
        <div className="mt-5 overflow-x-auto">
          <h3 className="font-medium">Committee relevance by skill</h3>
          <table className="mt-2 min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left">Committee</th>
                {skills.map((skill) => <th key={skill} className="p-2 text-left">{skill}</th>)}
              </tr>
            </thead>
            <tbody>
              {committees.map((committee) => (
                <tr key={committee.name}>
                  <td className="p-2">{committee.name}</td>
                  {skills.map((skill) => (
                    <td key={skill} className="p-2">
                      <input className="w-24 rounded border px-2 py-1" disabled={disabled} value={config.relevance?.[committee.name]?.[skill] ?? ""} onChange={(event) => setRelevance(committee.name, skill, event.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
