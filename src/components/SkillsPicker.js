"use client";

import { useState } from "react";

const SUGGESTED_SKILLS = [
  "Communication",
  "Leadership",
  "Teamwork",
  "Problem Solving",
  "Ownership",
  "Creativity",
  "Time Management",
  "Critical Thinking",
  "Technical Skills",
  "Networking",
  "Decision Making",
  "Discipline",
];

/**
 * Skills picker — suggested skill toggles + custom skill input + selected list.
 */
export default function SkillsPicker({ skills, setSkills, isEditable }) {
  const [customSkill, setCustomSkill] = useState("");

  const toggleSkill = (s) => {
    if (skills.includes(s)) setSkills(skills.filter((x) => x !== s));
    else setSkills([...skills, s]);
  };

  const addCustom = () => {
    const v = customSkill.trim();
    if (!v || skills.includes(v)) return;
    setSkills([...skills, v]);
    setCustomSkill("");
  };

  return (
    <div className="pt-2">
      <h2 className="text-base font-semibold text-brand-text">Skills</h2>
      <p className="text-sm text-brand-muted mt-1">
        Select skills you want in feedback for this event.
      </p>

      {/* Suggested */}
      <div className="mt-4">
        <div className="text-sm font-medium text-brand-text">Suggested</div>
        <div className="mt-2 flex flex-wrap">
          {SUGGESTED_SKILLS.map((s) => {
            const active = skills.includes(s);
            return (
              <button
                disabled={!isEditable}
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={`mr-2 mb-2 rounded-full px-3 py-1 text-sm border disabled:opacity-60 disabled:pointer-events-none transition-colors ${active
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-brand-text border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom */}
      <div className="mt-5">
        <div className="text-sm font-medium text-brand-text">
          Add custom skill
        </div>
        <div className="mt-2 flex gap-2">
          <input
            disabled={!isEditable}
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50 transition-shadow"
            placeholder="e.g., Public Speaking"
          />
          <button
            disabled={!isEditable}
            type="button"
            onClick={addCustom}
            className="rounded-xl bg-brand-primary text-white font-medium px-4 py-2 hover:opacity-95 transition-opacity"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected */}
      <div className="mt-5">
        <div className="text-sm font-medium text-brand-text">Selected</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.length === 0 ? (
            <span className="text-sm text-brand-muted">
              No skills selected yet.
            </span>
          ) : (
            skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-brand-text"
              >
                {s}
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                    className="text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
