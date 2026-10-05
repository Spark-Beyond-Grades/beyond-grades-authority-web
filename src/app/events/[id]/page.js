"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getEventById,
  updateEvent,
  publishEvent,
  getParticipants,
  closeEvent,
  uploadEventPoster,
  deleteEvent,
  previewEventScores,
  recalculateEventScores,
} from "@/lib/api";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import StatusChip from "@/components/StatusChip";
import EventForm from "@/components/EventForm";
import TeamStructureEditor from "@/components/TeamStructureEditor";
import SkillsPicker from "@/components/SkillsPicker";
import ParticipantUploader from "@/components/ParticipantUploader";
import ScoringSettings from "@/components/ScoringSettings";
import { coverageSentence } from "@/lib/coverageSentence.mjs";
import { previewAuditLabel, snapshotSavedLabel } from "@/lib/previewAudit.mjs";
import { previewConfidenceLabel, previewEventScoreLine, previewSkillScoreLine } from "@/lib/previewScore.mjs";
import { participantUploadPlan } from "@/lib/saveBeforeUpload.mjs";
import { feedbackWindowLabel } from "@/lib/feedbackWindow";
import { toDateTimeLocal, toIsoDateTime } from "@/lib/dateTimeLocal";
import PublishBar from "@/components/PublishBar";

function missingSettingLabel(key) {
  const labels = {
    scoringConfig: "scoring setup",
    scaleMin: "lowest raw rating",
    scaleMax: "highest raw rating",
    scaleRange: "a scale whose highest rating is above the lowest",
    levelInfluence: "level influence",
    committeeWeightSame: "same-committee weight",
    committeeWeightTop: "top-rank weight",
    committeeWeightOther: "other-committee weight",
    credibilityEpsilon: "a credibility constant above zero",
    credibilityShrinkage: "credibility shrinkage",
    confidencePrior: "confidence prior",
    evenMedianRule: "even-median rule",
    allowSelfRatings: "self-rating choice",
    blankSkillPolicy: "blank-skill rule",
    unscoredSkillPolicy: "unscored-skill rule",
    crossEventRule: "cross-event rule",
    applyRelevanceToSkillWeights: "whether relevance replaces skill weights",
    contributesToScoring: "whether this event counts toward EPA",
    levelRank: "a level on every participant",
    committee: "a committee on every participant",
    minimumRatings: "a valid minimum review count",
  };
  if (key.startsWith("nonNegative:relevance:")) {
    const [, , committee, skill] = key.split(":");
    return `relevance for ${committee} and ${skill} of zero or higher`;
  }
  if (key.startsWith("nonNegative:skillWeight:")) {
    return `a skill weight for ${key.slice("nonNegative:skillWeight:".length)} of zero or higher`;
  }
  if (key.startsWith("nonNegative:")) {
    const field = key.slice("nonNegative:".length);
    return `a ${labels[field] || field} of zero or higher`;
  }
  if (key.startsWith("levelRank:")) return `a rank for ${key.slice("levelRank:".length)}`;
  if (key.startsWith("skillWeight:")) return `a skill weight for ${key.slice("skillWeight:".length)}`;
  if (key.startsWith("relevance:")) {
    const [, committee, skill] = key.split(":");
    return `relevance for ${committee} and ${skill}`;
  }
  return labels[key] || key;
}

function EventContent() {
  const { id } = useParams();
  const router = useRouter();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);

  // Form state
  const [name, setName] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [openAt, setOpenAt] = useState("");
  const [closeAtTentative, setCloseAtTentative] = useState("");
  const [poster, setPoster] = useState(null);
  const [posterUrl, setPosterUrl] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);

  // Team structure
  const [levels, setLevels] = useState([]);
  const [committees, setCommittees] = useState([]);

  // Skills
  const [skills, setSkills] = useState([]);
  const [scoringConfig, setScoringConfig] = useState({});
  const [scorePreview, setScorePreview] = useState(null);

  // Participants
  const [participantsCount, setParticipantsCount] = useState(0);

  // Actions
  const [closing, setClosing] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const isPublished = event?.status === "PUBLISHED";
  const isClosed = event?.status === "CLOSED" || !!event?.closeAtActual;
  const isEditable = event?.effectiveStatus === "DRAFT";
  const coverageLine = coverageSentence(scorePreview?.coverage);
  const imagesEditable = !isClosed;

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getEventById(token, id);
      const ev = data.event;
      setEvent(ev);

      const p = await getParticipants(token, id);
      setParticipantsCount((p.participants || []).length);

      // Populate form
      setName(ev?.name || "");
      setEventStartDate(toDateTimeLocal(ev?.eventStartDate));
      setEventEndDate(toDateTimeLocal(ev?.eventEndDate));
      setVenue(ev?.venue || "");
      setDescription(ev?.description || "");
      setOpenAt(toDateTimeLocal(ev?.openAt));
      setCloseAtTentative(toDateTimeLocal(ev?.closeAtTentative));
      setPosterUrl(ev?.posterUrl || null);
      setPoster(null);
      setLogoUrl(ev?.logoUrl || null);
      setLogo(null);
      setLevels(ev?.levels || []);
      setCommittees(ev?.committees || []);
      setSkills(ev?.skills || []);
      setScoringConfig(ev?.scoringConfig || {});
      setScorePreview(ev?.frozenScores || null);
    } catch (e) {
      setError(e.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    load();
  }, [load]);

  /** Build the payload from current form state. */
  const buildPayload = () => ({
    name,
    eventStartDate: toIsoDateTime(eventStartDate),
    eventEndDate: toIsoDateTime(eventEndDate),
    venue,
    description,
    openAt: toIsoDateTime(openAt),
    closeAtTentative: toIsoDateTime(closeAtTentative),
    levels,
    committees,
    skills,
    scoringConfig,
    posterUrl,
    logoUrl,
  });

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const token = await getToken();

      let currentPosterUrl = posterUrl;

      // 1. Upload poster if selected
      if (poster) {
        const uploadData = await uploadEventPoster(token, id, poster);
        currentPosterUrl = uploadData.posterUrl;
        setPosterUrl(currentPosterUrl);
        setPoster(null);
      }

      let currentLogoUrl = logoUrl;
      // 2. Upload logo if selected
      if (logo) {
        const { uploadEventLogo } = await import("@/lib/api");
        const uploadData = await uploadEventLogo(token, id, logo);
        currentLogoUrl = uploadData.logoUrl;
        setLogoUrl(currentLogoUrl);
        setLogo(null);
      }

      // Draft saves the whole form. A published event still needs its scoring settings saved.
      const data = isEditable
        ? await updateEvent(token, id, {
            ...buildPayload(),
            posterUrl: currentPosterUrl,
            logoUrl: currentLogoUrl,
          })
        : await updateEvent(token, id, {
            posterUrl: currentPosterUrl,
            logoUrl: currentLogoUrl,
            openAt: toIsoDateTime(openAt),
            closeAtTentative: toIsoDateTime(closeAtTentative),
            scoringConfig,
          });
      setEvent(data.event);
      if (Array.isArray(data.event?.levels)) setLevels(data.event.levels);
      if (Array.isArray(data.event?.committees)) setCommittees(data.event.committees);
      if (Array.isArray(data.event?.skills)) setSkills(data.event.skills);
      if (data.event?.scoringConfig) setScoringConfig(data.event.scoringConfig);
      setSuccessMsg(isEditable ? "✅ Draft saved successfully" : "✅ Scoring saved");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };
  const handlePublish = async () => {
    const token = await getToken();

    let currentPosterUrl = posterUrl;

    // 1. Upload poster if selected before publishing
    if (poster) {
      const uploadData = await uploadEventPoster(token, id, poster);
      currentPosterUrl = uploadData.posterUrl;
      setPosterUrl(currentPosterUrl);
      setPoster(null);
    }

    let currentLogoUrl = logoUrl;
    // 2. Upload logo if selected
    if (logo) {
      const { uploadEventLogo } = await import("@/lib/api");
      const uploadData = await uploadEventLogo(token, id, logo);
      currentLogoUrl = uploadData.logoUrl;
      setLogoUrl(currentLogoUrl);
      setLogo(null);
    }

    // Save latest values first
    const payload = {
      ...buildPayload(),
      posterUrl: currentPosterUrl,
      logoUrl: currentLogoUrl,
    };
    await updateEvent(token, id, payload);
    // Then publish
    const data = await publishEvent(token, id);
    setEvent(data.event);

    // Refresh data and redirect
    const refreshed = await getEventById(token, id);
    setEvent(refreshed.event);
    const p = await getParticipants(token, id);
    setParticipantsCount((p.participants || []).length);

    router.push(`/events/${id}/published`);
  };

  const handleDelete = async () => {
    const yes = confirm("Delete this event and its participants and feedback?");
    if (!yes) return;
    try {
      const token = await getToken();
      await deleteEvent(token, id);
      router.push("/dashboard");
    } catch (e) {
      setActionMsg(e.message || "Delete failed");
    }
  };

  const handleRecalculate = async () => {
    const yes = confirm("Recalculate scores and keep the previous result in the audit history?");
    if (!yes) return;
    try {
      const token = await getToken();
      const data = await recalculateEventScores(token, id);
      setEvent((current) => ({ ...(current || {}), frozenScores: data.frozenScores, frozenScoreHistory: data.history }));
      setScorePreview(data.frozenScores);
      setActionMsg("Scores recalculated. The previous snapshot is kept.");
    } catch (e) {
      setActionMsg(e.message || "Recalculate failed");
    }
  };

  const handlePreviewScores = async () => {
    try {
      const token = await getToken();
      const saved = await updateEvent(token, id, isEditable ? buildPayload() : {
        posterUrl,
        logoUrl,
        openAt: toIsoDateTime(openAt),
        closeAtTentative: toIsoDateTime(closeAtTentative),
        scoringConfig,
      });
      if (Array.isArray(saved.event?.levels)) setLevels(saved.event.levels);
      if (Array.isArray(saved.event?.committees)) setCommittees(saved.event.committees);
      if (Array.isArray(saved.event?.skills)) setSkills(saved.event.skills);
      if (saved.event?.scoringConfig) setScoringConfig(saved.event.scoringConfig);
      const data = await previewEventScores(token, id);
      setScorePreview(data.scored);
    } catch (e) {
      setActionMsg(e.message || "Score preview failed");
    }
  };

  const handleClose = async () => {
    const yes = confirm("Close feedback now? This cannot be undone.");
    if (!yes) return;

    setActionMsg(null);
    setClosing(true);
    try {
      const token = await getToken();
      await updateEvent(token, id, { scoringConfig });
      const data = await closeEvent(token, id);
      setEvent(data.event);
      setScorePreview(data.event?.frozenScores || null);
      setActionMsg("✅ Feedback closed. The scores below are the frozen snapshot.");
    } catch (e) {
      setActionMsg(`❌ ${e.message || "Close failed"}`);
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <Navbar />
        <div className="max-w-3xl mx-auto p-6">
          <div className="text-sm text-brand-muted animate-pulse">
            Loading event...
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-brand-bg">
        <Navbar />
        <div className="max-w-3xl mx-auto p-6 text-sm text-red-700">
          Event not found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {event?.name || "Untitled Event"}
              </h1>
              <StatusChip status={event?.effectiveStatus} />
            </div>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {isEditable
                ? "Complete setup and publish."
                : isClosed
                  ? "This event is closed. Editing is locked."
                  : "Event details are locked. You can still update scoring settings, the logo, and the poster."}
            </p>
            {!isEditable && (
              <p className="text-sm text-slate-700 mt-1 font-semibold">
                {feedbackWindowLabel({
                  isClosed,
                  openAt,
                  closeAtTentative,
                  lateSubmissions: scoringConfig?.lateSubmissions,
                })}
              </p>
            )}
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold px-5 py-2.5 hover:bg-slate-50 hover:shadow-sm transition-all"
          >
            Back
          </button>
        </div>

        {/* Close Action */}
        {event?.status === "PUBLISHED" && !event?.closeAtActual && (
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              disabled={closing}
              onClick={handleClose}
              className="rounded-xl bg-status-closed text-white font-medium px-4 py-2 hover:opacity-95 disabled:opacity-60 transition-opacity"
            >
              {closing ? "Closing..." : "Close Feedback"}
            </button>
            {actionMsg && (
              <div className="text-sm rounded-lg px-3 py-2 border border-slate-200 bg-white text-brand-text">
                {actionMsg}
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-700 animate-fade-in">
            {successMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Main Form Wrapper */}
        <div className="mt-8">
          <div className="flex flex-col gap-0">
            <EventForm
              name={name}
              setName={setName}
              eventStartDate={eventStartDate}
              setEventStartDate={setEventStartDate}
              eventEndDate={eventEndDate}
              setEventEndDate={setEventEndDate}
              venue={venue}
              setVenue={setVenue}
              description={description}
              setDescription={setDescription}
              openAt={openAt}
              setOpenAt={setOpenAt}
              closeAtTentative={closeAtTentative}
              setCloseAtTentative={setCloseAtTentative}
              poster={poster}
              setPoster={setPoster}
              posterUrl={posterUrl}
              setPosterUrl={setPosterUrl}
              logo={logo}
              setLogo={setLogo}
              logoUrl={logoUrl}
              setLogoUrl={setLogoUrl}
              isEditable={isEditable}
              imagesEditable={imagesEditable}
              getToken={getToken}
              universityName={event?.universityName}
            />

            <TeamStructureEditor
              levels={levels}
              setLevels={setLevels}
              committees={committees}
              setCommittees={setCommittees}
              isEditable={isEditable}
              getToken={getToken}
            />

            <SkillsPicker
              skills={skills}
              setSkills={setSkills}
              isEditable={isEditable}
            />

            <ScoringSettings
              levels={levels}
              committees={committees}
              skills={skills}
              value={scoringConfig}
              onChange={setScoringConfig}
              disabled={isClosed}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {!isClosed ? (
                <button type="button" onClick={handlePreviewScores} className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
                  Save scoring and preview
                </button>
              ) : null}
              <button type="button" onClick={handleRecalculate} className="rounded-full border border-slate-300 px-4 py-2 text-sm">
                Recalculate and keep history
              </button>
            </div>
            {(event?.frozenScoreHistory || []).length ? (
              <p className="mt-3 text-sm text-slate-600">
                Audit history: {event.frozenScoreHistory.length} earlier snapshot{event.frozenScoreHistory.length === 1 ? "" : "s"}.
                Latest previous freeze {event.frozenScoreHistory.at(-1)?.frozenAt || "has no timestamp"}.
              </p>
            ) : null}
            {isClosed && scorePreview ? (
              <p className="mt-3 text-sm text-slate-600">Frozen snapshot from when this event was closed. Recalculate only if you intend to replace it and keep this one in the history.</p>
            ) : null}
            {scorePreview?.frozenAt ? (
              <p className="mt-1 text-sm text-slate-600">{snapshotSavedLabel(scorePreview.frozenAt, Intl.DateTimeFormat().resolvedOptions().timeZone)}</p>
            ) : null}
            {scorePreview ? (
              <p className="mt-3 text-sm font-medium text-slate-800">Score status: {previewAuditLabel(scorePreview, isClosed)}</p>
            ) : null}
            {scorePreview?.formulaVersion ? (
              <p className="mt-1 text-sm text-slate-600">Formula {scorePreview.formulaVersion}. {scorePreview.eligible === false ? "This event is excluded from EPA." : ""}</p>
            ) : null}
            {coverageLine ? (
              <p className="mt-1 text-sm text-slate-600">{coverageLine}</p>
            ) : null}
            {scorePreview?.missing?.length ? (
              <p className="mt-3 text-sm text-amber-700">Still needed: {scorePreview.missing.map(missingSettingLabel).join(", ")}</p>
            ) : null}
            {scorePreview?.participants?.length ? (
              <div className="mt-3 divide-y rounded-xl bg-slate-50 px-4 text-sm">
                {scorePreview.participants.map((person) => (
                  <div key={person.email} className="py-3">
                    <div className="flex justify-between gap-4">
                      <span>{person.name ? `${person.name} · ${person.email}` : person.email}</span>
                      <span>
                        {previewEventScoreLine(person.eventScore, person.scaleMin ?? scorePreview.scaleMin, person.scaleMax ?? scorePreview.scaleMax, person.reason, person.status)}
                      </span>
                    </div>
                    {previewConfidenceLabel(person.confidence) ? <p className="text-slate-500">{previewConfidenceLabel(person.confidence)}</p> : null}
                    {(person.skills || []).map((skill) => (
                      <p key={skill.skill} className="text-slate-600">
                        {previewSkillScoreLine(skill.skill, skill.score, person.scaleMin ?? scorePreview.scaleMin, person.scaleMax ?? scorePreview.scaleMax, skill.reason, skill.confidence)}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}
            <button type="button" onClick={handleDelete} className="mt-4 text-sm font-medium text-red-600">
              Delete event
            </button>

            <ParticipantUploader
              eventId={id}
              getToken={getToken}
              participantsCount={participantsCount}
              setParticipantsCount={setParticipantsCount}
              isEditable={!isClosed}
              beforeUpload={participantUploadPlan(isEditable).saveFormFirst ? async () => {
                const token = await getToken();
                const data = await updateEvent(token, id, buildPayload());
                if (Array.isArray(data.event?.levels)) setLevels(data.event.levels);
                if (Array.isArray(data.event?.committees)) setCommittees(data.event.committees);
                if (Array.isArray(data.event?.skills)) setSkills(data.event.skills);
                if (data.event?.scoringConfig) setScoringConfig(data.event.scoringConfig);
              } : undefined}
            />

            {/* Elegant Floating Save Pill (Sticky) */}
            <div className="sticky bottom-6 z-40 mx-auto w-max flex items-center gap-2 bg-white/95 backdrop-blur-xl border border-slate-200 p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] mt-12 mb-8">
              <button
                onClick={load}
                disabled={saving}
                className="text-slate-500 font-semibold px-6 py-2.5 rounded-full hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving || isClosed}
                className="flex items-center gap-2 rounded-full bg-brand-primary text-white font-semibold px-8 py-2.5 shadow-sm hover:shadow-md hover:opacity-95 disabled:opacity-60 transition-all"
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                )}
                {saving
                  ? "Saving..."
                  : isClosed
                    ? "Closed"
                    : isEditable
                      ? "Save Changes"
                      : "Save scoring"}
              </button>
            </div>
          </div>
        </div>

        {/* Publish Bar */}
        <PublishBar
          event={event}
          isEditable={isEditable}
          isPublished={isPublished}
          isClosed={isClosed}
          onPublish={handlePublish}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}

export default function EventOverviewPage() {
  return (
    <ProtectedRoute>
      <EventContent />
    </ProtectedRoute>
  );
}
