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
    "flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50 transition-shadow";

  const addBtnClass =
    "rounded-xl bg-brand-primary text-white font-medium px-4 py-2 hover:opacity-95 transition-opacity";

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
    <div className="pt-2">
      <h2 className="text-base font-semibold text-brand-text">
        Team Structure
      </h2>
      <p className="text-sm text-brand-muted mt-1">
        Define levels and committees, then map which levels belong to which
        committee.
      </p>

      {/* Levels */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-brand-text">
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

        <div className="mt-3 flex flex-wrap gap-2">
          {levels.map((lv) => (
            <span
              key={lv}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-brand-text"
            >
              {toTitleCase(lv)}
              {isEditable && (
                <button
                  type="button"
                  onClick={() => removeLevel(lv)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  ✕
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
      <div className="mt-6">
        <label className="block text-sm font-medium text-brand-text">
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

        <div className="mt-3 grid gap-2">
          {committees.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
            >
              <div className="text-sm font-medium text-brand-text">
                {toTitleCase(c.name)}
              </div>
              {isEditable && (
                <button
                  type="button"
                  onClick={() => removeCommittee(c.name)}
                  className="text-sm text-slate-400 hover:text-slate-700 transition-colors"
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
      <div className="mt-6">
        <label className="block text-sm font-medium text-brand-text">
          Mapping (Committee × Level)
        </label>
        <p className="text-xs text-brand-muted mt-1">
          Tick which levels belong to each committee.
        </p>

        {levels.length === 0 || committees.length === 0 ? (
          <div className="mt-3 text-sm text-brand-muted">
            Add at least 1 level and 1 committee to enable mapping.
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-[640px] w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-brand-muted font-medium">
                    Committee
                  </th>
                  {levels.map((lv) => (
                    <th
                      key={lv}
                      className="text-left px-4 py-3 text-brand-muted font-medium"
                    >
                      {toTitleCase(lv)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {committees.map((c) => (
                  <tr key={c.name} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-brand-text">
                      {toTitleCase(c.name)}
                    </td>
                    {levels.map((lv) => {
                      const checked = (c.allowedLevels || []).includes(lv);
                      return (
                        <td key={lv} className="px-4 py-3">
                          <input
                            disabled={!isEditable}
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              toggleMapping(c.name, lv, e.target.checked)
                            }
                            className="h-4 w-4 accent-brand-primary"
                          />
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
    </div>
  );
}
