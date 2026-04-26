"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getEvents, createEvent } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import StatusChip from "@/components/StatusChip";
import PlanSelection from "@/components/PlanSelection";

/* ─── SVG Icons (inline, no deps) ─── */
const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const RefreshIcon = ({ spinning }) => (
  <svg className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const LocationIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);
const SparkleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
  </svg>
);

/* ─── Stat Card ─── */
function StatCard({ label, value, accentClass, icon, delay }) {
  return (
    <div
      className={`glass-card p-4 sm:p-5 ${accentClass} animate-fade-in-up animation-delay-${delay}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-brand-text mt-1">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 flex items-center justify-center text-brand-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton Card ─── */
function SkeletonCard({ delay = 0 }) {
  return (
    <div className={`glass-card p-5 animate-fade-in-up animation-delay-${delay}`}>
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-3">
          <div className="shimmer h-5 w-3/5" />
          <div className="shimmer h-4 w-4/5" />
          <div className="flex gap-3 mt-2">
            <div className="shimmer h-3 w-24" />
            <div className="shimmer h-3 w-24" />
          </div>
        </div>
        <div className="shimmer h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

/* ─── Stat Skeleton ─── */
function StatSkeleton() {
  return (
    <div className="glass-card p-5">
      <div className="shimmer h-3 w-16 mb-3" />
      <div className="shimmer h-8 w-12" />
    </div>
  );
}

/* ─── Event Card ─── */
function EventCard({ event, onClick, delay }) {
  const statusBarClass = {
    DRAFT: "event-bar-draft",
    SCHEDULED: "event-bar-scheduled",
    OPEN: "event-bar-open",
    CLOSED: "event-bar-closed",
  }[event.effectiveStatus] || "event-bar-draft";

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <button
      onClick={onClick}
      className={`
        text-left w-full glass-card glass-card-hover ${statusBarClass} p-5
        animate-fade-in-up animation-delay-${delay}
        group cursor-pointer
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-brand-text truncate group-hover:text-brand-primary transition-colors">
              {event.name || "Untitled Event"}
            </h3>
          </div>



          {/* Event Date + Venue */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted mt-1">
            {event.eventDate ? (
              <span className="inline-flex items-center gap-1">
                <CalendarIcon />
                {formatDate(event.eventDate)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-brand-muted/50">
                <CalendarIcon />
                No date set
              </span>
            )}
            {event.venue ? (
              <span className="inline-flex items-center gap-1">
                <LocationIcon />
                {event.venue}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-brand-muted/50">
                <LocationIcon />
                No venue set
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusChip status={event.effectiveStatus} />
          <span className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ArrowRightIcon />
          </span>
        </div>
      </div>
    </button>
  );
}

/* ─── Main Dashboard Content ─── */
function DashboardContent() {
  const router = useRouter();
  const { user, getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);

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

  // Open plan selection modal
  const handleCreate = () => {
    setShowPlanSelection(true);
  };

  // Called after user picks a plan
  const handlePlanConfirm = async (planId) => {
    setCreating(true);
    setError(null);
    try {
      const token = await getToken();
      const data = await createEvent(token, {
        name: "Untitled Event",
        type: "OTHER",
        plan: planId,
      });
      const eventId = data?.event?._id;
      setShowPlanSelection(false);
      if (eventId) router.push(`/events/${eventId}`);
      else await loadEvents();
    } catch (e) {
      setError(e.message || "Create event failed");
    } finally {
      setCreating(false);
    }
  };

  /* ─── Computed stats ─── */
  const stats = useMemo(() => {
    const total = events.length;
    const active = events.filter((e) => e.effectiveStatus === "OPEN").length;
    const drafts = events.filter((e) => e.effectiveStatus === "DRAFT").length;
    const closed = events.filter((e) => e.effectiveStatus === "CLOSED").length;
    return { total, active, drafts, closed };
  }, [events]);

  /* ─── Greeting ─── */
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const displayName =
    user?.displayName?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="bg-mesh">
      <Navbar />

      {/* ── Plan Selection Modal ── */}
      {showPlanSelection && (
        <PlanSelection
          onClose={() => setShowPlanSelection(false)}
          onConfirm={handlePlanConfirm}
          creating={creating}
        />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ─── Hero Header ─── */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-brand-text">
            {greeting}, {displayName} 👋
          </h1>
          <p className="text-sm sm:text-base text-brand-muted mt-1">
            Here&apos;s an overview of your feedback events.
          </p>
        </div>

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {loading ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <StatSkeleton key={i} />
              ))}
            </>
          ) : (
            <>
              <StatCard
                label="Total Events"
                value={stats.total}
                accentClass="stat-accent-total"
                delay={100}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                }
              />
              <StatCard
                label="Active"
                value={stats.active}
                accentClass="stat-accent-active"
                delay={200}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                }
              />
              <StatCard
                label="Drafts"
                value={stats.drafts}
                accentClass="stat-accent-draft"
                delay={300}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                }
              />
              <StatCard
                label="Closed"
                value={stats.closed}
                accentClass="stat-accent-closed"
                delay={400}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </>
          )}
        </div>

        {/* ─── Error Banner ─── */}
        {error && (
          <div className="mt-5 glass-card border-red-200/60 bg-red-50/60 p-4 text-sm text-red-700 flex items-center gap-2 animate-fade-in-up">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* ─── Events Section ─── */}
        <div className="mt-8">
          <div className="flex items-center justify-between gap-4 mb-4 animate-fade-in-up animation-delay-100">
            <h2 className="text-lg font-semibold text-brand-text">Your Events</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={loadEvents}
                disabled={loading}
                className="btn-secondary text-sm py-2 px-3 inline-flex items-center gap-1.5"
              >
                <RefreshIcon spinning={loading} />
                <span className="hidden sm:inline">{loading ? "Refreshing…" : "Refresh"}</span>
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-1.5"
              >
                <PlusIcon />
                <span>{creating ? "Creating…" : "New Event"}</span>
              </button>
            </div>
          </div>

          {/* ─── Content ─── */}
          {loading ? (
            <div className="grid gap-3">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonCard key={i} delay={i * 100 + 200} />
              ))}
            </div>
          ) : events.length === 0 ? (
            /* ── Empty State ── */
            <div className="glass-card p-8 sm:p-12 text-center animate-fade-in-up animation-delay-200">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center mb-5">
                <span className="text-brand-primary">
                  <SparkleIcon />
                </span>
              </div>
              <h2 className="text-xl font-bold text-brand-text">
                No events yet
              </h2>
              <p className="text-sm text-brand-muted mt-2 max-w-md mx-auto">
                Create your first feedback event to start collecting insights. You can begin with a draft and add dates &amp; participants later.
              </p>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="btn-primary text-sm py-2.5 px-6 mt-6 inline-flex items-center gap-2"
              >
                <PlusIcon />
                {creating ? "Creating…" : "Create Your First Event"}
              </button>
            </div>
          ) : (
            /* ── Events List ── */
            <div className="grid gap-3">
              {events.map((ev, idx) => (
                <EventCard
                  key={ev._id}
                  event={ev}
                  onClick={() => router.push(`/events/${ev._id}`)}
                  delay={Math.min(idx * 75 + 150, 600)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
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
