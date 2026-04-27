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
    <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 backdrop-blur-xl mt-8">
      <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
        <span className="w-2 h-6 bg-teal-400 rounded-full inline-block"></span>
        Skills
      </h2>
      <p className="text-sm text-slate-500 mt-2 font-medium">
        Select skills you want in feedback for this event.
      </p>

      {/* Suggested */}
      <div className="mt-8">
        <div className="text-sm font-semibold text-brand-text mb-3">Suggested</div>
        <div className="mt-2 flex flex-wrap">
          {SUGGESTED_SKILLS.map((s) => {
            const active = skills.some(x => toTitleCase(x) === toTitleCase(s));
            return (
              <button
                disabled={!isEditable}
                key={s}
                type="button"
                onClick={() => toggleSkill(s)}
                className={`mr-2 mb-2 rounded-full px-4 py-1.5 text-sm font-medium border disabled:opacity-60 disabled:pointer-events-none transition-all duration-200 hover:shadow-sm ${active
                    ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom */}
      <div className="mt-8">
        <div className="text-sm font-semibold text-brand-text mb-3">
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
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-brand-text outline-none focus:bg-white focus:ring-2 focus:ring-brand-accent focus:border-transparent disabled:opacity-60 disabled:bg-slate-100 transition-all duration-200 ease-in-out shadow-sm hover:shadow"
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
            className="rounded-2xl bg-brand-primary text-white font-bold px-6 py-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected */}
      <div className="mt-8">
        <div className="text-sm font-semibold text-brand-text mb-3">Selected</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {skills.length === 0 ? (
            <span className="text-sm text-brand-muted">
              No skills selected yet.
            </span>
          ) : (
            skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-800 shadow-sm transition-all hover:shadow"
              >
                {toTitleCase(s)}
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                    className="text-teal-500 hover:text-teal-800 hover:scale-110 transition-all focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
