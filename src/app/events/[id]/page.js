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
} from "@/lib/api";

import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import StatusChip from "@/components/StatusChip";
import EventForm from "@/components/EventForm";
import TeamStructureEditor from "@/components/TeamStructureEditor";
import SkillsPicker from "@/components/SkillsPicker";
import ParticipantUploader from "@/components/ParticipantUploader";
import PublishBar from "@/components/PublishBar";

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
  const [eventDate, setEventDate] = useState("");
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

  // Participants
  const [participantsCount, setParticipantsCount] = useState(0);

  // Actions
  const [closing, setClosing] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  const isPublished = event?.status === "PUBLISHED";
  const isClosed = event?.status === "CLOSED" || !!event?.closeAtActual;
  const isEditable = event?.effectiveStatus === "DRAFT";

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
      setEventDate(ev?.eventDate ? new Date(ev.eventDate).toISOString().slice(0, 10) : "");
      setVenue(ev?.venue || "");
      setDescription(ev?.description || "");
      setOpenAt(
        ev?.openAt ? new Date(ev.openAt).toISOString().slice(0, 16) : ""
      );
      setCloseAtTentative(
        ev?.closeAtTentative
          ? new Date(ev.closeAtTentative).toISOString().slice(0, 16)
          : ""
      );
      setPosterUrl(ev?.posterUrl || null);
      setPoster(null);
      setLogoUrl(ev?.logoUrl || null);
      setLogo(null);
      setLevels(ev?.levels || []);
      setCommittees(ev?.committees || []);
      setSkills(ev?.skills || []);
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
    eventDate: eventDate ? new Date(eventDate).toISOString() : null,
    venue,
    description,
    openAt: openAt ? new Date(openAt).toISOString() : null,
    closeAtTentative: closeAtTentative
      ? new Date(closeAtTentative).toISOString()
      : null,
    levels,
    committees,
    skills,
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

      // 3. Save other fields
      const payload = {
        ...buildPayload(),
        posterUrl: currentPosterUrl,
        logoUrl: currentLogoUrl,
      };
      const data = await updateEvent(token, id, payload);
      setEvent(data.event);
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

  const handleClose = async () => {
    const yes = confirm("Close feedback now? This cannot be undone.");
    if (!yes) return;

    setActionMsg(null);
    setClosing(true);
    try {
      const token = await getToken();
      const data = await closeEvent(token, id);
      setEvent(data.event);
      setActionMsg("✅ Feedback closed");
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
      <div className="max-w-3xl mx-auto p-6">
        {/* Header */}
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
            className="rounded-xl border border-slate-200 bg-white text-brand-text font-medium px-4 py-2 hover:bg-slate-50 transition-colors"
          >
            Back
          </button>
        </div>

        {/* Close Action */}
        {event?.effectiveStatus === "OPEN" && (
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

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Main Form Card */}
        <div className="mt-6 rounded-2xl bg-brand-surface border border-slate-200 p-6">
          <div className="grid gap-6">
            <EventForm
              name={name}
              setName={setName}
              eventDate={eventDate}
              setEventDate={setEventDate}
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
              logo={logo}
              setLogo={setLogo}
              logoUrl={logoUrl}
              isEditable={isEditable}
            />

            <TeamStructureEditor
              levels={levels}
              setLevels={setLevels}
              committees={committees}
              setCommittees={setCommittees}
              isEditable={isEditable}
            />

            <SkillsPicker
              skills={skills}
              setSkills={setSkills}
              isEditable={isEditable}
            />

            <ParticipantUploader
              eventId={id}
              getToken={getToken}
              participantsCount={participantsCount}
              setParticipantsCount={setParticipantsCount}
              isEditable={isEditable}
            />

            {/* Save / Reset */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={load}
                disabled={saving}
                className="rounded-xl border border-slate-200 bg-white text-brand-text font-medium px-4 py-2 hover:bg-slate-50 disabled:opacity-60 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={!isEditable || saving}
                className="rounded-xl bg-brand-primary text-white font-medium px-5 py-2 hover:opacity-95 disabled:opacity-60 transition-opacity"
              >
                {saving ? "Saving..." : "Save Changes"}
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
