"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getEvents, createEvent } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import StatusChip from "@/components/StatusChip";

function DashboardContent() {
  const router = useRouter();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  const loadEvents = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getEvents(token);
      setEvents(data.events || []);
    } catch (e) {
      setError(e.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const token = await getToken();
      const data = await createEvent(token, {
        name: "Untitled Event",
        type: "OTHER",
      });

      const eventId = data?.event?._id;
      if (eventId) router.push(`/events/${eventId}`);
      else await loadEvents();
    } catch (e) {
      setError(e.message || "Create event failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-brand-text">Events</h1>
            <p className="text-sm text-brand-muted mt-1">
              Create and manage feedback events.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadEvents}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white text-brand-text font-medium px-4 py-2 hover:bg-slate-50 disabled:opacity-60 transition-colors"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              onClick={handleCreate}
              disabled={creating}
              className="rounded-xl bg-brand-primary text-white font-medium px-4 py-2 hover:opacity-95 disabled:opacity-60 transition-opacity"
            >
              {creating ? "Creating..." : "Create New Event"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-brand-surface border border-slate-200 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="h-5 w-48 rounded-lg bg-slate-200 animate-pulse" />
                      <div className="h-4 w-72 rounded-lg bg-slate-100 animate-pulse mt-2" />
                    </div>
                    <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl bg-brand-surface border border-slate-200 p-6 text-center">
              <h2 className="text-lg font-semibold text-brand-text">
                No events yet
              </h2>
              <p className="text-sm text-brand-muted mt-1">
                Create your first event to start collecting feedback.
              </p>
              <p className="text-xs text-brand-muted mt-2">
                Tip: Start with a draft — you can add dates &amp; participants
                later.
              </p>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="mt-4 rounded-xl bg-brand-primary text-white font-medium px-4 py-2 hover:opacity-95 disabled:opacity-60 transition-opacity"
              >
                {creating ? "Creating..." : "Create New Event"}
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {events.map((ev) => (
                <button
                  key={ev._id}
                  onClick={() => router.push(`/events/${ev._id}`)}
                  className="text-left rounded-2xl bg-brand-surface border border-slate-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-brand-text">
                        {ev.name || "Untitled Event"}
                      </div>
                      <div className="text-sm text-brand-muted mt-1">
                        Open:{" "}
                        {ev.openAt
                          ? new Date(ev.openAt).toLocaleString()
                          : "—"}{" "}
                        • Close:{" "}
                        {ev.closeAtTentative
                          ? new Date(ev.closeAtTentative).toLocaleString()
                          : "—"}
                      </div>
                    </div>
                    <StatusChip status={ev.effectiveStatus} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
