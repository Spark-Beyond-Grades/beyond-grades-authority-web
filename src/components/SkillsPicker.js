"use client";

import { useState, useEffect, useCallback } from "react";
import { getSuggestions } from "@/lib/api";

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

const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

/**
 * Skills picker — suggested skill toggles + custom skill input + selected list.
 * Now with database suggestions and de-duplication.
 */
export default function SkillsPicker({ skills, setSkills, isEditable, getToken }) {
  const [customSkill, setCustomSkill] = useState("");
  const [dbSkills, setDbSkills] = useState([]);
  const [skillOpen, setSkillOpen] = useState(false);
  const [skillIdx, setSkillIdx] = useState(-1);

  // Fetch from DB on mount
  useEffect(() => {
    if (!getToken) return;
    const load = async () => {
      try {
        const token = await getToken();
        const data = await getSuggestions(token);
        if (data.ok) {
          setDbSkills(data.skills || []);
        }
      } catch (err) {
        console.error("Failed to load skill suggestions:", err);
      }
    };
    load();
  }, [getToken]);

  const toggleSkill = (s) => {
    const formatted = toTitleCase(s);
    if (skills.some(x => toTitleCase(x) === formatted)) {
      setSkills(skills.filter((x) => toTitleCase(x) !== formatted));
    } else {
      setSkills([...skills, formatted]);
    }
  };

  const addCustom = () => {
    const v = toTitleCase(customSkill.trim());
    if (!v || skills.some(x => toTitleCase(x) === v)) return;
    setSkills([...skills, v]);
    setCustomSkill("");
    setSkillOpen(false);
    setSkillIdx(-1);
  };

  const getTieredMatches = useCallback((query, dbList, defaultList) => {
    if (!query.trim()) {
      const results = dbList.length > 0 ? dbList.slice(0, 10) : defaultList.slice(0, 5);
      return Array.from(new Set(results.map(toTitleCase)));
    }

    const q = query.toLowerCase();
    const allItems = Array.from(new Set([...dbList, ...defaultList]));

    // Tier 1: Starts with
    const starts = allItems.filter(x => x.toLowerCase().startsWith(q));
    // Tier 2: Includes full query
    const contains = allItems.filter(x => x.toLowerCase().includes(q) && !x.toLowerCase().startsWith(q));

    // Tier 3: Relative/Fuzzy (Substrings for typos)
    let relative = [];
    if (q.length >= 3) {
      const sub = q.slice(1);
      const sub2 = q.slice(0, -1);
      relative = allItems.filter(x =>
        (x.toLowerCase().includes(sub) || x.toLowerCase().includes(sub2)) &&
        !starts.includes(x) && !contains.includes(x)
      );
    }

    const finalResults = [...starts, ...contains, ...relative].slice(0, 15);
    return Array.from(new Set(finalResults.map(toTitleCase)));
  }, []);

  const skillMatches = getTieredMatches(customSkill, dbSkills, SUGGESTED_SKILLS);

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
            const active = skills.some(x => toTitleCase(x) === toTitleCase(s));
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
        <div className="mt-2 flex gap-2 relative">
          <div className="flex-1 relative">
            <input
              disabled={!isEditable}
              value={customSkill}
              onFocus={() => isEditable && setSkillOpen(true)}
              onChange={(e) => {
                setCustomSkill(e.target.value);
                setSkillOpen(true);
                setSkillIdx(-1);
              }}
              onKeyDown={(e) => {
                if (!skillOpen) {
                  if (e.key === "Enter") addCustom();
                  return;
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setSkillIdx(prev => (prev + 1) % skillMatches.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setSkillIdx(prev => (prev - 1 + skillMatches.length) % skillMatches.length);
                } else if (e.key === "Enter" || e.key === "Tab") {
                  if (skillIdx >= 0 && skillMatches[skillIdx]) {
                    e.preventDefault();
                    setCustomSkill(skillMatches[skillIdx]);
                    setSkillOpen(false);
                    setSkillIdx(-1);
                  } else if (e.key === "Enter") {
                    addCustom();
                  }
                } else if (e.key === "Escape") {
                  setSkillOpen(false);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50 transition-shadow"
              placeholder="e.g., Public Speaking"
              autoComplete="off"
            />
            {skillOpen && isEditable && skillMatches.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                {skillMatches.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setCustomSkill(s);
                      setSkillOpen(false);
                      setSkillIdx(-1);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm text-brand-text transition-colors ${skillIdx === i ? "bg-brand-accent text-brand-primary" : "hover:bg-slate-50"
                      }`}
                  >
                    {s}
                  </button>
                ))}
                <div className="fixed inset-0 z-[-1]" onClick={() => setSkillOpen(false)} />
              </div>
            )}
          </div>
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
                {toTitleCase(s)}
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
