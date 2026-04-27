"use client";

import { useState, useEffect, useCallback } from "react";
import { getSuggestions } from "@/lib/api";

const DEFAULT_LEVELS = ["Core", "Senior", "Junior", "Volunteer", "Coordinator", "Lead", "Head", "Secretary"];
const DEFAULT_COMMITTEES = ["Technical", "Marketing", "Operations", "Logistics", "Sponsorship", "Creative", "Media", "Finance", "Security", "Cultural"];

const toTitleCase = (str) => {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

/**
 * Manages levels, committees, and the level × committee mapping grid.
 * Now optimized with database-backed suggestions and tiered filtering.
 */
export default function TeamStructureEditor({
  levels,
  setLevels,
  committees,
  setCommittees,
  isEditable,
  getToken,
}) {
  const [newLevel, setNewLevel] = useState("");
  const [newCommittee, setNewCommittee] = useState("");

  const [levelOpen, setLevelOpen] = useState(false);
  const [committeeOpen, setCommitteeOpen] = useState(false);
  const [levelIdx, setLevelIdx] = useState(-1);
  const [committeeIdx, setCommitteeIdx] = useState(-1);

  // Suggestions from Database
  const [dbLevels, setDbLevels] = useState([]);
  const [dbCommittees, setDbCommittees] = useState([]);

  // Fetch from DB on mount
  useEffect(() => {
    if (!getToken) return;
    const load = async () => {
      try {
        const token = await getToken();
        const data = await getSuggestions(token);
        if (data.ok) {
          setDbLevels(data.levels || []);
          setDbCommittees(data.committees || []);
        }
      } catch (err) {
        console.error("Failed to load suggestions:", err);
      }
    };
    load();
  }, [getToken]);

  const inputClass =
    "flex-1 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-brand-text outline-none focus:bg-white focus:ring-2 focus:ring-brand-accent focus:border-transparent disabled:opacity-60 disabled:bg-slate-100 transition-all duration-200 ease-in-out shadow-sm hover:shadow";

  const addBtnClass =
    "rounded-2xl bg-brand-primary text-white font-bold px-6 py-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200";

  const addLevel = () => {
    const v = toTitleCase(newLevel.trim());
    if (!v || levels.includes(v)) return;
    setLevels([...levels, v]);
    setNewLevel("");
    setLevelOpen(false);
    setLevelIdx(-1);
  };

  const removeLevel = (lv) => {
    setLevels(levels.filter((x) => x !== lv));
    setCommittees(
      committees.map((c) => ({
        ...c,
        allowedLevels: (c.allowedLevels || []).filter((x) => x !== lv),
      }))
    );
  };

  const addCommittee = () => {
    const v = toTitleCase(newCommittee.trim());
    if (!v || committees.some((c) => c.name === v)) return;
    setCommittees([...committees, { name: v, allowedLevels: [] }]);
    setNewCommittee("");
    setCommitteeOpen(false);
    setCommitteeIdx(-1);
  };

  const removeCommittee = (name) => {
    setCommittees(committees.filter((x) => x.name !== name));
  };

  const toggleMapping = (committeeName, level, checked) => {
    setCommittees(
      committees.map((x) => {
        if (x.name !== committeeName) return x;
        const allowed = new Set(x.allowedLevels || []);
        if (checked) allowed.add(level);
        else allowed.delete(level);
        return { ...x, allowedLevels: Array.from(allowed) };
      })
    );
  };

  /**
   * Tiered Filter Logic:
   * 1. DB matches that start with query (Top 5)
   * 2. DB matches that contain query (others)
   * 3. Defaults that match (if not already in DB list)
   */
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
      const sub = q.slice(1); // Handle typo at start like "hech" -> "ech"
      const sub2 = q.slice(0, -1); // Handle typo at end
      relative = allItems.filter(x =>
        (x.toLowerCase().includes(sub) || x.toLowerCase().includes(sub2)) &&
        !starts.includes(x) && !contains.includes(x)
      );
    }

    const finalResults = [...starts, ...contains, ...relative].slice(0, 5);
    return Array.from(new Set(finalResults.map(toTitleCase)));
  }, []);

  const levelMatches = getTieredMatches(newLevel, dbLevels, DEFAULT_LEVELS);
  const committeeMatches = getTieredMatches(newCommittee, dbCommittees, DEFAULT_COMMITTEES);

  return (
    <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 backdrop-blur-xl mt-8">
      <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
        <span className="w-2 h-6 bg-pink-400 rounded-full inline-block"></span>
        Team Structure
      </h2>
      <p className="text-sm text-slate-500 mt-2 font-medium">
        Define levels and committees, then map which levels belong to which
        committee.
      </p>

      {/* Levels */}
      <div className="mt-8">
        <label className="block text-sm font-semibold text-brand-text">
          Levels
        </label>
        <div className="mt-2 flex gap-2 relative">
          <div className="flex-1 relative">
            <input
              disabled={!isEditable}
              value={newLevel}
              onFocus={() => isEditable && setLevelOpen(true)}
              onChange={(e) => {
                setNewLevel(e.target.value);
                setLevelOpen(true);
                setLevelIdx(-1);
              }}
              onKeyDown={(e) => {
                if (!levelOpen) {
                  if (e.key === "Enter") addLevel();
                  return;
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setLevelIdx(prev => (prev + 1) % levelMatches.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setLevelIdx(prev => (prev - 1 + levelMatches.length) % levelMatches.length);
                } else if (e.key === "Enter" || e.key === "Tab") {
                  if (levelIdx >= 0 && levelMatches[levelIdx]) {
                    e.preventDefault();
                    setNewLevel(levelMatches[levelIdx]);
                    setLevelOpen(false);
                    setLevelIdx(-1);
                  } else if (e.key === "Enter") {
                    addLevel();
                  }
                } else if (e.key === "Escape") {
                  setLevelOpen(false);
                }
              }}
              className={inputClass + " w-full"}
              placeholder="e.g., Core, Senior, Junior"
              autoComplete="off"
            />
            {levelOpen && isEditable && levelMatches.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                {levelMatches.map((l, i) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      setNewLevel(l);
                      setLevelOpen(false);
                      setLevelIdx(-1);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm text-brand-text transition-colors ${levelIdx === i ? "bg-brand-accent text-brand-primary" : "hover:bg-slate-50"
                      }`}
                  >
                    {l}
                  </button>
                ))}
                <div className="fixed inset-0 z-[-1]" onClick={() => setLevelOpen(false)} />
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={!isEditable}
            onClick={addLevel}
            className={addBtnClass}
          >
            Add
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {levels.map((lv) => (
            <span
              key={lv}
              className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-4 py-1.5 text-sm font-medium text-pink-700 shadow-sm transition-all hover:shadow"
            >
              {toTitleCase(lv)}
              {isEditable && (
                <button
                  type="button"
                  onClick={() => removeLevel(lv)}
                  className="text-pink-400 hover:text-pink-700 hover:scale-110 transition-all focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              )}
            </span>
          ))}
          {levels.length === 0 && (
            <span className="text-sm text-brand-muted">
              No levels added yet.
            </span>
          )}
        </div>
      </div>

      {/* Committees */}
      <div className="mt-10">
        <label className="block text-sm font-semibold text-brand-text">
          Committees
        </label>
        <div className="mt-2 flex gap-2 relative">
          <div className="flex-1 relative">
            <input
              disabled={!isEditable}
              value={newCommittee}
              onFocus={() => isEditable && setCommitteeOpen(true)}
              onChange={(e) => {
                setNewCommittee(e.target.value);
                setCommitteeOpen(true);
                setCommitteeIdx(-1);
              }}
              onKeyDown={(e) => {
                if (!committeeOpen) {
                  if (e.key === "Enter") addCommittee();
                  return;
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setCommitteeIdx(prev => (prev + 1) % committeeMatches.length);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setCommitteeIdx(prev => (prev - 1 + committeeMatches.length) % committeeMatches.length);
                } else if (e.key === "Enter" || e.key === "Tab") {
                  if (committeeIdx >= 0 && committeeMatches[committeeIdx]) {
                    e.preventDefault();
                    setNewCommittee(committeeMatches[committeeIdx]);
                    setCommitteeOpen(false);
                    setCommitteeIdx(-1);
                  } else if (e.key === "Enter") {
                    addCommittee();
                  }
                } else if (e.key === "Escape") {
                  setCommitteeOpen(false);
                }
              }}
              className={inputClass + " w-full"}
              placeholder="e.g., Marketing, Tech, Operations"
              autoComplete="off"
            />
            {committeeOpen && isEditable && committeeMatches.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                {committeeMatches.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setNewCommittee(c);
                      setCommitteeOpen(false);
                      setCommitteeIdx(-1);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm text-brand-text transition-colors ${committeeIdx === i ? "bg-brand-accent text-brand-primary" : "hover:bg-slate-50"
                      }`}
                  >
                    {c}
                  </button>
                ))}
                <div className="fixed inset-0 z-[-1]" onClick={() => setCommitteeOpen(false)} />
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={!isEditable}
            onClick={addCommittee}
            className={addBtnClass}
          >
            Add
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {committees.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 shadow-sm transition-all hover:shadow"
            >
              <div className="text-sm font-bold text-indigo-900">
                {toTitleCase(c.name)}
              </div>
              {isEditable && (
                <button
                  type="button"
                  onClick={() => removeCommittee(c.name)}
                  className="text-sm font-medium text-indigo-400 hover:text-red-500 hover:underline transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {committees.length === 0 && (
            <span className="text-sm text-brand-muted">
              No committees added yet.
            </span>
          )}
        </div>
      </div>

      {/* Mapping Grid */}
      <div className="mt-10">
        <label className="block text-sm font-semibold text-brand-text">
          Mapping (Committee × Level)
        </label>
        <p className="text-sm text-slate-500 mt-1">
          Tick which levels belong to each committee.
        </p>

        {levels.length === 0 || committees.length === 0 ? (
          <div className="mt-3 text-sm text-brand-muted">
            Add at least 1 level and 1 committee to enable mapping.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-3xl border border-slate-100 shadow-sm bg-white">
            <table className="min-w-[640px] w-full text-sm">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-4 text-slate-600 font-bold tracking-wide">
                    Committee
                  </th>
                  {levels.map((lv) => (
                    <th
                      key={lv}
                      className="text-left px-5 py-4 text-slate-600 font-bold tracking-wide"
                    >
                      {toTitleCase(lv)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {committees.map((c, idx) => (
                  <tr key={c.name} className={`transition-colors hover:bg-slate-50/50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                    <td className="px-5 py-4 font-semibold text-brand-text">
                      {toTitleCase(c.name)}
                    </td>
                    {levels.map((lv) => {
                      const checked = (c.allowedLevels || []).includes(lv);
                      return (
                        <td key={lv} className="px-5 py-4">
                          <label className="relative inline-flex items-center cursor-pointer group">
                            <input
                              disabled={!isEditable}
                              type="checkbox"
                              checked={checked}
                              onChange={(e) =>
                                toggleMapping(c.name, lv, e.target.checked)
                              }
                              className="sr-only peer"
                            />
                            <div className="w-5 h-5 bg-slate-100 border-2 border-slate-200 rounded peer peer-checked:bg-brand-primary peer-checked:border-brand-primary peer-focus:ring-2 peer-focus:ring-brand-accent transition-all duration-200 flex items-center justify-center group-hover:border-brand-primary/50">
                              <svg className={`w-3 h-3 text-white transform transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
