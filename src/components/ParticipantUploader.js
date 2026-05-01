"use client";

import { useState, useRef } from "react";
import { HiOutlineArrowUpTray } from "react-icons/hi2";
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
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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

    if (e.dataTransfer.files?.[0]) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleUpload({ target: { files: e.dataTransfer.files, value: "" } });
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
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mt-1">Total Uploaded</div>
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
                Drag and drop your file or <span className="text-brand-primary">click to browse</span>
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
