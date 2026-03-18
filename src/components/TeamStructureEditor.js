"use client";

import { useState } from "react";

/**
 * Manages levels, committees, and the level × committee mapping grid.
 */
export default function TeamStructureEditor({
  levels,
  setLevels,
  committees,
  setCommittees,
  isEditable,
}) {
  const [newLevel, setNewLevel] = useState("");
  const [newCommittee, setNewCommittee] = useState("");

  const inputClass =
    "flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50 transition-shadow";

  const addBtnClass =
    "rounded-xl bg-brand-primary text-white font-medium px-4 py-2 hover:opacity-95 transition-opacity";

  const addLevel = () => {
    const v = newLevel.trim();
    if (!v || levels.includes(v)) return;
    setLevels([...levels, v]);
    setNewLevel("");
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
    const v = newCommittee.trim();
    if (!v || committees.some((c) => c.name === v)) return;
    setCommittees([...committees, { name: v, allowedLevels: [] }]);
    setNewCommittee("");
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
        <div className="mt-2 flex gap-2">
          <input
            disabled={!isEditable}
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLevel()}
            className={inputClass}
            placeholder="e.g., Core, Senior, Junior"
          />
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
              {lv}
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
        <div className="mt-2 flex gap-2">
          <input
            disabled={!isEditable}
            value={newCommittee}
            onChange={(e) => setNewCommittee(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCommittee()}
            className={inputClass}
            placeholder="e.g., Marketing, Tech, Operations"
          />
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
                {c.name}
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
                      {lv}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {committees.map((c) => (
                  <tr key={c.name} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-brand-text">
                      {c.name}
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
