"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById } from "@/lib/api";

function StatusChip({ status }) {
  const map = {
    DRAFT: "bg-white border border-slate-200 text-slate-700",
    SCHEDULED: "bg-status-scheduled text-white",
    OPEN: "bg-status-open text-white",
    CLOSED: "bg-status-closed text-white",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center ${map[status] || "bg-slate-200 text-slate-700"}`}>
      {status}
    </span>
  );
}

export default function PublishedPage() {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("bg_id_token");
      if (!token) {
        router.push("/login");
        return;
      }
      const data = await getEventById(token, id);
      setEvent(data.event);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="min-h-screen bg-brand-bg p-6">
      <div className="max-w-2xl mx-auto">
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

            {event?.effectiveStatus && <StatusChip status={event.effectiveStatus} />}
          </div>

          <div className="mt-5">
            <div className="text-lg font-semibold text-brand-text">
              {event?.name || "Untitled Event"}
            </div>
            <div className="text-sm text-brand-muted mt-1">
              Open: {event?.openAt ? new Date(event.openAt).toLocaleString() : "—"} <br />
              Close: {event?.closeAtTentative ? new Date(event.closeAtTentative).toLocaleString() : "—"}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => router.push(`/events/${id}`)}
              className="rounded-xl bg-brand-primary text-white font-medium px-4 py-2 hover:opacity-95"
            >
              Go to Event Overview
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-200 bg-white text-brand-text font-medium px-4 py-2 hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
