"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getEventById } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import StatusChip from "@/components/StatusChip";

function PublishedContent() {
  const { id } = useParams();
  const router = useRouter();
  const { getToken } = useAuth();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const load = async () => {
      const token = await getToken();
      const data = await getEventById(token, id);
      setEvent(data.event);
    };
    load();
  }, [id, getToken]);

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <div className="rounded-2xl bg-brand-surface border border-slate-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-brand-text">
                ✅ Event Published Successfully
              </h1>
              <p className="text-sm text-brand-muted mt-1">
                Your event is now live based on the feedback window.
              </p>
            </div>
            {event?.effectiveStatus && (
              <StatusChip status={event.effectiveStatus} />
            )}
          </div>

          <div className="mt-5">
            <div className="text-lg font-semibold text-brand-text">
              {event?.name || "Untitled Event"}
            </div>
            <div className="text-sm text-brand-muted mt-1">
              Open:{" "}
              {event?.openAt
                ? new Date(event.openAt).toLocaleString()
                : "—"}{" "}
              <br />
              Close:{" "}
              {event?.closeAtTentative
                ? new Date(event.closeAtTentative).toLocaleString()
                : "—"}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => router.push(`/events/${id}`)}
              className="rounded-xl bg-brand-primary text-white font-medium px-4 py-2 hover:opacity-95 transition-opacity"
            >
              Go to Event Overview
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-200 bg-white text-brand-text font-medium px-4 py-2 hover:bg-slate-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublishedPage() {
  return (
    <ProtectedRoute>
      <PublishedContent />
    </ProtectedRoute>
  );
}
