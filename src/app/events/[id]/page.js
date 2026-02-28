"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getEventById,
  updateEvent,
  publishEvent,
  uploadParticipantsCsv,
  getParticipants,
  closeEvent,
} from "@/lib/api";

const EVENT_TYPES = [
  { value: "CLUB", label: "Club" },
  { value: "PROJECT", label: "Project" },
  { value: "FEST", label: "Fest" },
  { value: "COMMITTEE", label: "Committee" },
  { value: "OTHER", label: "Other" },
];

function StatusChip({ status }) {
  const map = {
    DRAFT: "bg-white border border-slate-200 text-slate-700",
    SCHEDULED: "bg-status-scheduled text-white",
    OPEN: "bg-status-open text-white",
    CLOSED: "bg-status-closed text-white",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center ${
        map[status] || "bg-slate-200 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function EventOverviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [event, setEvent] = useState(null);

  // form state
  const [name, setName] = useState("");
  const [type, setType] = useState("OTHER");
  const [description, setDescription] = useState("");
  const [openAt, setOpenAt] = useState("");
  const [closeAtTentative, setCloseAtTentative] = useState("");

  // Step 3.3 - Team structure
  const [levels, setLevels] = useState([]);
  const [committees, setCommittees] = useState([]);
  const [newLevel, setNewLevel] = useState("");
  const [newCommittee, setNewCommittee] = useState("");

  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");

  const [participantsCount, setParticipantsCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);

  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState(null);

  const isPublished = event?.status === "PUBLISHED";
  const isClosed = event?.status === "CLOSED" || !!event?.closeAtActual;

  const isEditable = event?.effectiveStatus === "DRAFT";

  const [closing, setClosing] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("bg_id_token");
  }, []);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const tokenNow = localStorage.getItem("bg_id_token");
      if (!tokenNow) {
        router.push("/login");
        return;
      }
      const data = await getEventById(tokenNow, id);
      const ev = data.event;
      setEvent(ev);
      const p = await getParticipants(tokenNow, id);
      setParticipantsCount((p.participants || []).length);

      setName(ev?.name || "");
      setType(ev?.type || "OTHER");
      setDescription(ev?.description || "");
      setOpenAt(
        ev?.openAt ? new Date(ev.openAt).toISOString().slice(0, 16) : ""
      );
      setCloseAtTentative(
        ev?.closeAtTentative
          ? new Date(ev.closeAtTentative).toISOString().slice(0, 16)
          : ""
      );
      setLevels(ev?.levels || []);
      setCommittees(ev?.committees || []);
      setSkills(ev?.skills || []);
    } catch (e) {
      setError(e.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async () => {
    setError(null);
    setSaving(true);
    try {
      if (!token) {
        router.push("/login");
        return;
      }

      const data = await updateEvent(token, id, {
        name,
        type,
        description,
        openAt: openAt ? new Date(openAt).toISOString() : null,
        closeAtTentative: closeAtTentative
          ? new Date(closeAtTentative).toISOString()
          : null,
        levels,
        committees,
        skills,
      });

      setEvent(data.event);
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg p-6">
        <div className="max-w-3xl mx-auto text-sm text-brand-muted">
          Loading event...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-brand-bg p-6">
        <div className="max-w-3xl mx-auto text-sm text-red-700">
          Event not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-brand-text">
                {event?.name || "Untitled Event"}
              </h1>
              <StatusChip status={event?.effectiveStatus} />
            </div>
            <p className="text-sm text-brand-muted mt-1">
              {isEditable
                ? "Complete setup and publish."
                : "This event is live. Editing is locked."}
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-200 bg-white text-brand-text font-medium px-4 py-2 hover:bg-slate-50"
          >
            Back
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          {event?.effectiveStatus === "OPEN" && (
            <button
              type="button"
              disabled={closing}
              onClick={async () => {
                const yes = confirm(
                  "Close feedback now? This cannot be undone."
                );
                if (!yes) return;

                setActionMsg(null);
                setClosing(true);
                try {
                  const tokenNow = localStorage.getItem("bg_id_token");
                  if (!tokenNow) {
                    router.push("/login");
                    return;
                  }
                  const data = await closeEvent(tokenNow, id);
                  setEvent(data.event);
                  setActionMsg("✅ Feedback closed");
                } catch (e) {
                  setActionMsg(`❌ ${e.message || "Close failed"}`);
                } finally {
                  setClosing(false);
                }
              }}
              className="rounded-xl bg-status-closed text-white font-medium px-4 py-2 hover:opacity-95 disabled:opacity-60"
            >
              {closing ? "Closing..." : "Close Feedback"}
            </button>
          )}

          {actionMsg && (
            <div className="text-sm rounded-lg px-3 py-2 border border-slate-200 bg-white text-brand-text">
              {actionMsg}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 rounded-2xl bg-brand-surface border border-slate-200 p-6">
          <div className="grid gap-5">
            <div>
              <label className="block text-sm font-medium text-brand-text">
                Event Name
              </label>
              <input
                disabled={!isEditable}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50"
                placeholder="e.g., IIC Recruitment Drive 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text">
                Event Type
              </label>
              <select
                disabled={!isEditable}
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text">
                Description (optional)
              </label>
              <textarea
                disabled={!isEditable}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50"
                placeholder="Short context about this event..."
              />
            </div>
            <div className="pt-2">
              <h2 className="text-base font-semibold text-brand-text">
                Feedback Window
              </h2>
              <p className="text-sm text-brand-muted mt-1">
                Set when feedback collection opens and closes. (Stored in UTC;
                you’ll enter in local time.)
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text">
                    Feedback Opening Date & Time
                  </label>
                  <input
                    disabled={!isEditable}
                    type="datetime-local"
                    value={openAt}
                    onChange={(e) => setOpenAt(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-text">
                    Feedback Closing Date & Time
                  </label>
                  <input
                    disabled={!isEditable}
                    type="datetime-local"
                    value={closeAtTentative}
                    onChange={(e) => setCloseAtTentative(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Team Structure */}
            <div className="pt-2">
              <h2 className="text-base font-semibold text-brand-text">
                Team Structure
              </h2>
              <p className="text-sm text-brand-muted mt-1">
                Define levels and committees, then map which levels belong to
                which committee.
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
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50"
                    placeholder="e.g., Core, Senior, Junior"
                  />
                  <button
                    type="button"
                    disabled={!isEditable}
                    onClick={() => {
                      const v = newLevel.trim();
                      if (!v) return;
                      if (levels.includes(v)) return;
                      setLevels([...levels, v]);
                      setNewLevel("");
                    }}
                    className="rounded-xl bg-brand-primary text-white font-medium px-4 py-2 hover:opacity-95"
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
                      <button
                        type="button"
                        disabled={!isEditable}
                        onClick={() => {
                          const nextLevels = levels.filter((x) => x !== lv);
                          const nextCommittees = committees.map((c) => ({
                            ...c,
                            allowedLevels: (c.allowedLevels || []).filter(
                              (x) => x !== lv
                            ),
                          }));
                          setLevels(nextLevels);
                          setCommittees(nextCommittees);
                        }}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        ✕
                      </button>
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
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50"
                    placeholder="e.g., Marketing, Tech, Operations"
                  />
                  <button
                    type="button"
                    disabled={!isEditable}
                    onClick={() => {
                      const v = newCommittee.trim();
                      if (!v) return;
                      if (committees.some((c) => c.name === v)) return;
                      setCommittees([
                        ...committees,
                        { name: v, allowedLevels: [] },
                      ]);
                      setNewCommittee("");
                    }}
                    className="rounded-xl bg-brand-primary text-white font-medium px-4 py-2 hover:opacity-95"
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
                      <button
                        type="button"
                        disabled={!isEditable}
                        onClick={() =>
                          setCommittees(
                            committees.filter((x) => x.name !== c.name)
                          )
                        }
                        className="text-sm text-slate-400 hover:text-slate-700 disabled:opacity-60"
                      >
                        Remove
                      </button>
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
                          <tr
                            key={c.name}
                            className="border-b border-slate-100"
                          >
                            <td className="px-4 py-3 font-medium text-brand-text">
                              {c.name}
                            </td>
                            {levels.map((lv) => {
                              const checked = (c.allowedLevels || []).includes(
                                lv
                              );
                              return (
                                <td key={lv} className="px-4 py-3">
                                  <input
                                    disabled={!isEditable}
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      if (!isEditable) return;
                                      const next = committees.map((x) => {
                                        if (x.name !== c.name) return x;
                                        const allowed = new Set(
                                          x.allowedLevels || []
                                        );
                                        if (e.target.checked) allowed.add(lv);
                                        else allowed.delete(lv);
                                        return {
                                          ...x,
                                          allowedLevels: Array.from(allowed),
                                        };
                                      });
                                      setCommittees(next);
                                    }}
                                    className="h-4 w-4"
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

            {/* Skills */}
            <div className="pt-2">
              <h2 className="text-base font-semibold text-brand-text">
                Skills
              </h2>
              <p className="text-sm text-brand-muted mt-1">
                Select skills you want in feedback for this event.
              </p>

              {/* Suggested skills */}
              <div className="mt-4">
                <div className="text-sm font-medium text-brand-text">
                  Suggested
                </div>

                {[
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
                ].map((s) => {
                  const active = skills.includes(s);
                  return (
                    <button
                      disabled={!isEditable}
                      key={s}
                      type="button"
                      onClick={() => {
                        if (active) setSkills(skills.filter((x) => x !== s));
                        else setSkills([...skills, s]);
                      }}
                      className={`mr-2 mb-2 rounded-full px-3 py-1 text-sm border disabled:opacity-60 disabled:pointer-events-none ${
                        active
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-white text-brand-text border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {/* Custom skill */}
              <div className="mt-5">
                <div className="text-sm font-medium text-brand-text">
                  Add custom skill
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    disabled={!isEditable}
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50"
                    placeholder="e.g., Public Speaking"
                  />
                  <button
                    disabled={!isEditable}
                    type="button"
                    onClick={() => {
                      const v = customSkill.trim();
                      if (!v) return;
                      if (skills.includes(v)) return;
                      setSkills([...skills, v]);
                      setCustomSkill("");
                    }}
                    className="rounded-xl bg-brand-primary text-white font-medium px-4 py-2 hover:opacity-95"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected skills */}
              <div className="mt-5">
                <div className="text-sm font-medium text-brand-text">
                  Selected
                </div>
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
                        <button
                          type="button"
                          disabled={!isEditable}
                          onClick={() =>
                            setSkills(skills.filter((x) => x !== s))
                          }
                          className="text-slate-400 hover:text-slate-700 disabled:opacity-60 disabled:pointer-events-none"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h2 className="text-base font-semibold text-brand-text">
                Participants
              </h2>
              <p className="text-sm text-brand-muted mt-1">
                Upload a CSV of participants. Current:{" "}
                <span className="font-medium">{participantsCount}</span>
              </p>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-medium text-brand-text">
                  CSV Format
                </div>
                <p className="text-xs text-brand-muted mt-1">
                  Columns:{" "}
                  <span className="font-mono">
                    name,email,rollNumber,committee,level,position
                  </span>
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setUploadMsg(null);
                      setUploading(true);

                      try {
                        const tokenNow = localStorage.getItem("bg_id_token");
                        if (!tokenNow) {
                          router.push("/login");
                          return;
                        }

                        const data = await uploadParticipantsCsv(
                          tokenNow,
                          id,
                          file
                        );
                        setUploadMsg(
                          `✅ Uploaded ${data.inserted}/${data.total} participants`
                        );

                        // refresh count
                        const p = await getParticipants(tokenNow, id);
                        setParticipantsCount((p.participants || []).length);
                      } catch (err) {
                        const details = err?.details?.errors?.slice?.(0, 3);
                        if (details?.length) {
                          setUploadMsg(
                            `❌ ${err.message}. Example: row ${details[0].row} ${details[0].field} - ${details[0].message}`
                          );
                        } else {
                          setUploadMsg(`❌ ${err.message || "Upload failed"}`);
                        }
                      } finally {
                        setUploading(false);
                        e.target.value = "";
                      }
                    }}
                    className="block w-full text-sm disabled:opacity-60"
                    disabled={!isEditable || uploading}
                  />

                  {uploading && (
                    <span className="text-xs text-brand-muted">
                      Uploading...
                    </span>
                  )}
                </div>

                {uploadMsg && <div className="mt-3 text-sm">{uploadMsg}</div>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={load}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white text-brand-text font-medium px-4 py-2 hover:bg-slate-50 disabled:opacity-60"
              >
                Reset
              </button>
              <button
                onClick={onSave}
                disabled={!isEditable || saving}
                className="rounded-xl bg-brand-primary text-white font-medium px-5 py-2 hover:opacity-95 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-xs text-brand-muted">
            Publish locks the event for participants.
          </div>

          <button
            type="button"
            disabled={!isEditable || publishing || isPublished || isClosed}
            onClick={async () => {
              setPublishMsg(null);
              setPublishing(true);

              try {
                const tokenNow = localStorage.getItem("bg_id_token");
                if (!tokenNow) {
                  router.push("/login");
                  return;
                }

                // save latest values first (important)
                await updateEvent(tokenNow, id, {
                  name,
                  type,
                  description,
                  openAt: openAt ? new Date(openAt).toISOString() : null,
                  closeAtTentative: closeAtTentative
                    ? new Date(closeAtTentative).toISOString()
                    : null,
                  levels,
                  committees,
                  skills,
                });

                const data = await publishEvent(tokenNow, id);
                setEvent(data.event);
                const refreshed = await getEventById(tokenNow, id);
                setEvent(refreshed.event);
                const p = await getParticipants(tokenNow, id);
                setParticipantsCount((p.participants || []).length);
                router.push(`/events/${id}/published`);
              } catch (e) {
                setPublishMsg(`❌ ${e.message || "Publish failed"}`);
              } finally {
                setPublishing(false);
              }
            }}
            className="rounded-xl bg-brand-secondary text-white font-medium px-5 py-2 hover:opacity-95 disabled:opacity-60"
          >
            {isClosed
              ? "Closed"
              : isPublished
              ? "Published"
              : publishing
              ? "Publishing..."
              : "Publish Event"}
          </button>
        </div>

        {publishMsg && (
          <div className="mt-3 text-sm rounded-lg p-3 border border-slate-200 bg-white text-brand-text">
            {publishMsg}
          </div>
        )}

        <div className="mt-4 text-xs text-brand-muted">
          Next step: add Skills and Questions setup.
        </div>
      </div>
    </div>
  );
}
