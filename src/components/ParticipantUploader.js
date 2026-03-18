"use client";

import { useState } from "react";
import { uploadParticipantsCsv, getParticipants } from "@/lib/api";

/**
 * CSV upload + participant count display.
 */
export default function ParticipantUploader({
  eventId,
  getToken,
  participantsCount,
  setParticipantsCount,
  isEditable,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMsg(null);
    setUploading(true);

    try {
      const token = await getToken();
      const data = await uploadParticipantsCsv(token, eventId, file);
      setUploadMsg(`✅ Uploaded ${data.inserted}/${data.total} participants`);

      // Refresh count
      const p = await getParticipants(token, eventId);
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
  };

  return (
    <div className="pt-2">
      <h2 className="text-base font-semibold text-brand-text">Participants</h2>
      <p className="text-sm text-brand-muted mt-1">
        Upload a CSV of participants. Current:{" "}
        <span className="font-medium">{participantsCount}</span>
      </p>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-medium text-brand-text">CSV Format</div>
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
            onChange={handleUpload}
            className="block w-full text-sm disabled:opacity-60"
            disabled={!isEditable || uploading}
          />
          {uploading && (
            <span className="text-xs text-brand-muted animate-pulse">
              Uploading...
            </span>
          )}
        </div>

        {uploadMsg && (
          <div className="mt-3 text-sm">{uploadMsg}</div>
        )}
      </div>
    </div>
  );
}
