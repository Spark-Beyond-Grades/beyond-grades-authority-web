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
    <div className="pt-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Participants</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your event participants with a CSV upload
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{participantsCount}</div>
          <div className="text-xs text-gray-500">Total Participants</div>
        </div>
      </div>

      <div className="space-y-4">
        {/* CSV Format Info */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="text-sm font-semibold text-gray-900">📋 CSV Format Required</div>
          <p className="text-xs text-gray-600 mt-2">
            Columns: <span className="bg-white px-2 py-1 rounded font-mono text-gray-700">name, email, rollNumber, committee, level, position</span>
          </p>
        </div>

        {/* Drag & Drop Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400"
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
            className="flex flex-col items-center justify-center py-12 px-4"
          >
            <div className={`text-5xl mb-3 transition-transform ${dragActive ? "scale-125" : "scale-100"}`}>
              <HiOutlineArrowUpTray className={`w-12 h-12 ${dragActive ? "text-blue-600" : "text-gray-400"}`} />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                {dragActive ? "Drop your CSV here" : "Upload CSV File"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop your file or click to browse
              </p>
            </div>
          </div>
        </div>

        {/* Upload Status */}
        {uploading && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700 font-medium">Uploading your file...</span>
          </div>
        )}

        {/* Upload Message */}
        {uploadMsg && (
          <div className={`rounded-lg p-4 text-sm font-medium border ${uploadMsg.startsWith("✅")
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
            }`}>
            {uploadMsg}
          </div>
        )}
      </div>
    </div>
  );
}
