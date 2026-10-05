"use client";

import { useEffect, useState, useRef } from "react";
import { HiOutlineArrowUpTray } from "react-icons/hi2";
import { uploadParticipantsCsv, getParticipants, removeParticipant } from "@/lib/api";
import { csvFileFromList } from "@/lib/saveBeforeUpload.mjs";

/**
 * CSV upload + participant count display.
 */
export default function ParticipantUploader({
  eventId,
  getToken,
  participantsCount,
  setParticipantsCount,
  isEditable,
  beforeUpload,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [removingEmail, setRemovingEmail] = useState("");
  const fileInputRef = useRef(null);

  const refreshParticipants = async () => {
    const token = await getToken();
    const data = await getParticipants(token, eventId);
    const rows = data.participants || [];
    setParticipants(rows);
    setParticipantsCount(rows.length);
  };

  useEffect(() => {
    refreshParticipants().catch(() => {});
  }, [eventId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !isEditable) return;

    setUploadMsg(null);
    setUploading(true);

    try {
      if (beforeUpload) await beforeUpload();
      const token = await getToken();
      const data = await uploadParticipantsCsv(token, eventId, file);
      const added = Number(data.inserted) || 0;
      const updated = Number(data.updated) || 0;
      const total = Number(data.total) || 0;
      const kept = Math.max(total - added - updated, 0);
      setUploadMsg(
        `✅ Saved ${total} participant${total === 1 ? "" : "s"}. ${added} new, ${updated} updated${kept ? `, ${kept} already on the list` : ""}.`
      );

      // Refresh count
      await refreshParticipants();
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
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!isEditable) return;

    if (csvFileFromList(e.dataTransfer.files)) {
      handleUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <section className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 backdrop-blur-xl mt-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-brand-text flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full inline-block"></span>
            Participants
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Optionally upload participants for events that collect feedback
          </p>
        </div>
        <div className="text-right bg-blue-50/50 rounded-2xl px-5 py-3 border border-blue-100">
          <div className="text-3xl font-black text-blue-600">{participantsCount}</div>
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mt-1">Participants</div>
        </div>
      </div>

      <div className="space-y-6">
        {/* CSV Format Info */}
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-800">CSV Format</div>
          <p className="text-sm text-slate-600 mt-2 flex flex-wrap gap-2 items-center">
            Columns: 
            <span className="bg-white px-3 py-1 rounded-lg font-mono text-xs border border-slate-200 shadow-sm text-slate-700">name</span>
            <span className="bg-white px-3 py-1 rounded-lg font-mono text-xs border border-slate-200 shadow-sm text-slate-700">email</span>
            <span className="bg-white px-3 py-1 rounded-lg font-mono text-xs border border-slate-200 shadow-sm text-slate-700">rollNumber</span>
            <span className="bg-white px-3 py-1 rounded-lg font-mono text-xs border border-slate-200 shadow-sm text-slate-700">committee</span>
            <span className="bg-white px-3 py-1 rounded-lg font-mono text-xs border border-slate-200 shadow-sm text-slate-700">level</span>
            <span className="bg-white px-3 py-1 rounded-lg font-mono text-xs border border-slate-200 shadow-sm text-slate-700">position</span>
          </p>
        </div>

        {/* Drag & Drop Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-[2rem] border-2 border-dashed transition-all duration-300 ${dragActive
            ? "border-blue-500 bg-blue-50/50 shadow-inner"
            : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/50 hover:border-brand-primary"
            } ${!isEditable || uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleUpload}
            className="hidden"
            disabled={!isEditable || uploading}
          />

          <div
            onClick={() => !uploading && isEditable ? fileInputRef.current?.click() : null}
            className="flex flex-col items-center justify-center py-16 px-6"
          >
            <div className={`mb-4 transition-transform duration-300 ${dragActive ? "scale-125 -translate-y-2" : "scale-100 hover:scale-110"}`}>
              <div className={`p-4 rounded-full ${dragActive ? "bg-blue-100 text-blue-600" : "bg-white text-slate-400 shadow-sm border border-slate-100"}`}>
                <HiOutlineArrowUpTray className="w-10 h-10" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-800">
                {dragActive ? "Drop your CSV here" : "Upload CSV File"}
              </p>
              <p className="text-sm text-slate-500 mt-2 font-medium">
                {isEditable
                  ? <>Drag and drop your file or <span className="text-brand-primary">click to browse</span></>
                  : "This event is closed, so the participant list is locked."}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Status */}
        {uploading && (
          <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-200 rounded-2xl p-5 shadow-sm">
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping"></div>
            <span className="text-sm text-blue-700 font-bold">Uploading and processing your file...</span>
          </div>
        )}

        {/* Upload Message */}
        {participants.length > 0 && (
          <div className="rounded-2xl border border-slate-200 divide-y">
            {participants.map((person) => (
              <div key={person.email} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{person.name || person.email}</div>
                  <div className="text-xs text-slate-500">{[person.email, person.level, person.committee].filter(Boolean).join(" · ")}</div>
                </div>
                {isEditable && (
                  <button
                    type="button"
                    disabled={removingEmail === person.email}
                    className="text-sm font-semibold text-red-600 disabled:opacity-50"
                    onClick={async () => {
                      if (!window.confirm(`Remove ${person.name || person.email} from this event? Their reviews will be removed too.`)) return;
                      setRemovingEmail(person.email);
                      try {
                        const token = await getToken();
                        await removeParticipant(token, eventId, person.email);
                        await refreshParticipants();
                        setUploadMsg(`✅ Removed ${person.name || person.email}`);
                      } catch (err) {
                        setUploadMsg(`❌ ${err.message || "Could not remove participant"}`);
                      } finally {
                        setRemovingEmail("");
                      }
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {uploadMsg && (
          <div className={`rounded-2xl p-5 text-sm font-bold shadow-sm border transition-all ${uploadMsg.startsWith("✅")
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
            }`}>
            {uploadMsg}
          </div>
        )}
      </div>
    </section>
  );
}
