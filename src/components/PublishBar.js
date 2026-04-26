"use client";

import { useState } from "react";

/**
 * Publish/Close action bar at the bottom of the event page.
 */
export default function PublishBar({
  event,
  isEditable,
  isPublished,
  isClosed,
  onPublish,
  onClose,
}) {
  const [publishMsg, setPublishMsg] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    setPublishMsg(null);
    setPublishing(true);
    try {
      await onPublish();
    } catch (e) {
      setPublishMsg(`❌ ${e.message || "Publish failed"}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-brand-muted">
          Publish locks the event for participants.
        </div>

        <button
          type="button"
          disabled={!isEditable || isPublished || isClosed || publishing}
          onClick={handlePublish}
          className="rounded-xl bg-brand-secondary text-white font-medium px-5 py-2 hover:opacity-95 disabled:opacity-60 transition-opacity"
        >
          {publishing
            ? "Publishing..."
            : isClosed
              ? "Closed"
              : isPublished
                ? "Published"
                : "Publish Event"}
        </button>
      </div>

      {publishMsg && (
        <div className="mt-3 text-sm rounded-lg p-3 border border-slate-200 bg-white text-brand-text">
          {publishMsg}
        </div>
      )}
    </>
  );
}
