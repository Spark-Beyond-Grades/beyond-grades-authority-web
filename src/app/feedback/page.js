"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getFeedbackSummary } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

/* ─── SVG Icons ─── */
const CheckCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const ChevronDownIcon = ({ open }) => (
  <svg
    className={`w-5 h-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);
const RefreshIcon = ({ spinning }) => (
  <svg className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const BarChartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

/* ─── Progress Ring ─── */
function ProgressRing({ pct, size = 72, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      {/* Track */}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
      {/* Fill */}
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={pct === 100 ? "#16A34A" : pct > 0 ? "#0EA5A4" : "#CBD5E1"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

/* ─── Status Chip ─── */
function StatusChip({ status }) {
  const map = {
    OPEN: "bg-green-50 text-green-700 border border-green-200",
    CLOSED: "bg-red-50 text-red-700 border border-red-200",
    PUBLISHED: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    SCHEDULED: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    DRAFT: "bg-slate-100 text-slate-600 border border-slate-200",
  };
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${map[status] || map.DRAFT}`}>
      {status}
    </span>
  );
}

/* ─── Per-Participant Completion Badge ─── */
function CompletionBadge({ given, required, pct }) {
  const color = pct === 100 ? "text-green-700 bg-green-50 border-green-200" : pct > 0 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-slate-500 bg-slate-100 border-slate-200";
  const barColor = pct === 100 ? "#16A34A" : pct > 0 ? "#F59E0B" : "#CBD5E1";
  return (
    <div className="flex flex-col items-end gap-1">
      <span className={`inline-flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-full ${color}`}>
        {pct === 100 ? <CheckCircleIcon /> : <ClockIcon />}
        {given}/{required}
      </span>
      <div className="w-16 h-1 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <span className="text-[10px] text-brand-muted">{pct}%</span>
    </div>
  );
}

/* ─── Target Name Chip ─── */
function TargetChip({ name, email, rated }) {
  return (
    <span title={email} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${
      rated ? "bg-green-50 border-green-200 text-green-700" : "bg-slate-100 border-slate-200 text-slate-500 line-through opacity-60"
    }`}>
      {rated ? "✓" : "✗"} {name}
    </span>
  );
}

/* ─── Skeleton Loaders ─── */
function SummaryStatSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="h-3 bg-slate-200 rounded w-24 mb-3" />
      <div className="h-8 bg-slate-200 rounded w-16" />
    </div>
  );
}
function EventCardSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-[72px] h-[72px] rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-2/5" />
          <div className="h-3 bg-slate-200 rounded w-1/3" />
          <div className="flex gap-3">
            <div className="h-6 bg-slate-200 rounded-full w-24" />
            <div className="h-6 bg-slate-200 rounded-full w-24" />
          </div>
        </div>
        <div className="h-8 bg-slate-200 rounded w-20 shrink-0" />
      </div>
    </div>
  );
}

/* ─── Participant Table ─── */
function ParticipantTable({ participants }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const complete = participants.filter((p) => p.isComplete);
  const partial  = participants.filter((p) => !p.isComplete && p.submittedCount > 0);
  const none     = participants.filter((p) => p.submittedCount === 0);

  const filtered = useMemo(() => {
    let rows = participants;
    if (filter === "complete") rows = complete;
    if (filter === "none")     rows = participants.filter((p) => !p.isComplete);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(q) ||
          (r.email || "").toLowerCase().includes(q) ||
          (r.committee || "").toLowerCase().includes(q) ||
          (r.rollNumber || "").toLowerCase().includes(q)
      );
    }
    return rows;
  }, [participants, filter, search, complete, partial, none]);

  return (
    <div className="mt-4 border border-brand-stroke/60 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white/50 border-b border-brand-stroke/40">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2"><SearchIcon /></span>
          <input type="text" placeholder="Search name, email, roll…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-brand-stroke rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary w-56 transition" />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {[
            { key: "all",      label: `All (${participants.length})` },
            { key: "complete", label: `✅ Complete (${complete.length})` },
            { key: "none",     label: `⏳ Pending (${participants.length - complete.length})` },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${filter === tab.key ? "bg-white shadow-sm text-brand-primary" : "text-brand-muted hover:text-brand-text"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 text-left">
              <th className="px-4 py-2.5 text-xs font-semibold text-brand-muted uppercase tracking-wider">Name</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-brand-muted uppercase tracking-wider">Email</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-brand-muted uppercase tracking-wider hidden sm:table-cell">Roll No.</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-brand-muted uppercase tracking-wider hidden md:table-cell">Committee</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-brand-muted uppercase tracking-wider hidden md:table-cell">Level</th>
              <th className="px-4 py-2.5 text-xs font-semibold text-brand-muted uppercase tracking-wider text-right">Completion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-stroke/40">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-brand-muted">No participants match your search.</td></tr>
            ) : (
              filtered.map((row) => (
                <ParticipantRow key={row._id || row.email} row={row} allParticipants={participants} />
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-2 text-[11px] text-brand-muted/70 bg-slate-50/60 border-t border-brand-stroke/20 italic">
        ↑ Click any row to see exactly who that person gave feedback to.
      </p>
    </div>
  );
}

/* ─── Expandable Participant Row ─── */
function ParticipantRow({ row, allParticipants }) {
  const [open, setOpen] = useState(false);

  // Build full picture: all peers this person should rate
  const ratedEmailSet = new Set((row.ratedTargets || []).map((t) => t.email.toLowerCase()));
  const peers = allParticipants
    .filter((p) => (p.email || "").toLowerCase() !== (row.email || "").toLowerCase())
    .map((p) => ({
      email: p.email,
      name: p.name || p.email,
      rated: ratedEmailSet.has((p.email || "").toLowerCase()),
    }));

  const rowBg = row.isComplete ? "hover:bg-green-50/30" : row.submittedCount > 0 ? "hover:bg-amber-50/30" : "hover:bg-slate-50/50";

  return (
    <>
      <tr
        className={`transition-colors cursor-pointer ${rowBg} ${open ? "bg-brand-primary/5" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <td className="px-4 py-3 font-medium text-brand-text">
          <div className="flex items-center gap-1.5">
            <ChevronDownIcon open={open} />
            {row.name || <span className="text-brand-muted/50 italic">—</span>}
          </div>
        </td>
        <td className="px-4 py-3 text-brand-muted truncate max-w-[160px]">{row.email}</td>
        <td className="px-4 py-3 text-brand-muted hidden sm:table-cell">{row.rollNumber || <span className="opacity-40">—</span>}</td>
        <td className="px-4 py-3 text-brand-muted hidden md:table-cell">{row.committee || <span className="opacity-40">—</span>}</td>
        <td className="px-4 py-3 text-brand-muted hidden md:table-cell">{row.level || <span className="opacity-40">—</span>}</td>
        <td className="px-4 py-3 text-right">
          <CompletionBadge given={row.submittedCount} required={row.requiredCount} pct={row.completionPct} />
        </td>
      </tr>
      {open && (
        <tr className="bg-brand-primary/[0.03] border-b border-brand-stroke/30">
          <td colSpan={6} className="px-6 py-4">
            <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
              Feedback given by {row.name || row.email} to:
            </p>
            {peers.length === 0 ? (
              <span className="text-xs text-brand-muted italic">No other participants in this event.</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {peers.map((peer) => (
                  <TargetChip key={peer.email} name={peer.name} email={peer.email} rated={peer.rated} />
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
function EventSummaryCard({ summary, index }) {
  const [open, setOpen] = useState(false);

  const { event, totalParticipants, fullySubmittedCount, partialCount, notStartedCount, participants } = summary;
  const pct = totalParticipants > 0 ? Math.round((fullySubmittedCount / totalParticipants) * 100) : 0;

  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div
      className="glass-card border-l-4 border-l-brand-primary overflow-hidden"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Card Header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-5 group"
      >
        <div className="flex items-center gap-4">
          {/* Progress Ring */}
          <div className="relative shrink-0">
            <ProgressRing pct={pct} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-brand-text">
              {pct}%
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-brand-text group-hover:text-brand-primary transition-colors truncate">
                {event.name || "Untitled Event"}
              </h3>
              <StatusChip status={event.effectiveStatus} />
              {event.type && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted/70 bg-brand-primary/5 px-2 py-0.5 rounded-md">
                  {event.type}
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-muted">
              {event.eventDate && <span>📅 {formatDate(event.eventDate)}</span>}
              {event.venue && <span>📍 {event.venue}</span>}
              {event.openAt && <span>Opens {formatDate(event.openAt)}</span>}
            </div>

            {/* Count pills */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100 text-brand-muted px-2.5 py-1 rounded-full">
                {totalParticipants} Participants
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full">
                <CheckCircleIcon /> {fullySubmittedCount} Complete
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                <ClockIcon /> {totalParticipants - fullySubmittedCount} Pending
              </span>
            </div>
          </div>

          {/* Expand Toggle */}
          <div className="text-brand-muted shrink-0">
            <ChevronDownIcon open={open} />
          </div>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: pct === 100 ? "#16A34A" : "linear-gradient(90deg, #0EA5A4, #14D4D3)",
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-brand-muted mt-1">
          <span>{fullySubmittedCount} fully complete</span>
          <span>{totalParticipants - fullySubmittedCount} pending</span>
        </div>
      </button>

      {/* Expandable Table */}
      {open && (
        <div className="px-5 pb-5 border-t border-brand-stroke/40 pt-4">
          {totalParticipants === 0 ? (
            <div className="text-center py-8 text-sm text-brand-muted">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <UsersIcon />
              </div>
              No participants uploaded for this event yet.
            </div>
          ) : (
            <ParticipantTable participants={participants} />
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Summary Stats Bar ─── */
function SummaryStats({ summaries }) {
  const totals = useMemo(() => {
    return summaries.reduce(
      (acc, s) => ({
        events: acc.events + 1,
        participants: acc.participants + s.totalParticipants,
        submitted: acc.submitted + s.fullySubmittedCount,
        pending: acc.pending + (s.totalParticipants - s.fullySubmittedCount),
      }),
      { events: 0, participants: 0, submitted: 0, pending: 0 }
    );
  }, [summaries]);

  const overallPct =
    totals.participants > 0
      ? Math.round((totals.submitted / totals.participants) * 100)
      : 0;

  const stats = [
    { label: "Events Tracked", value: totals.events, accent: "border-l-brand-primary", icon: <BarChartIcon /> },
    { label: "Total Participants", value: totals.participants, accent: "border-l-indigo-400", icon: <UsersIcon /> },
    { label: "Fully Complete", value: totals.submitted, accent: "border-l-green-500", icon: <CheckCircleIcon /> },
    { label: "Pending", value: totals.pending, accent: "border-l-amber-400", icon: <ClockIcon /> },
    { label: "Completion Rate", value: `${overallPct}%`, accent: "border-l-teal-400", icon: <BarChartIcon /> },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`glass-card p-4 border-l-4 ${s.accent}`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-brand-muted uppercase tracking-wider">{s.label}</p>
            <span className="text-brand-primary opacity-60">{s.icon}</span>
          </div>
          <p className="text-2xl font-bold text-brand-text">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Main Feedback Content ─── */
function FeedbackContent() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const token = await getToken();
      const data = await getFeedbackSummary(token);
      setSummaries(data.summaries || []);
    } catch (e) {
      setError(e.message || "Failed to load feedback data");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="bg-mesh">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ─── Header ─── */}
        <div className="flex items-start justify-between gap-4 mb-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-text">
              Feedback Analytics
            </h1>
            <p className="text-sm sm:text-base text-brand-muted mt-1">
              Track who has submitted feedback and how many are pending per event.
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="btn-secondary text-sm py-2 px-3 inline-flex items-center gap-1.5 shrink-0"
          >
            <RefreshIcon spinning={loading} />
            <span className="hidden sm:inline">{loading ? "Loading…" : "Refresh"}</span>
          </button>
        </div>

        {/* ─── Error Banner ─── */}
        {error && (
          <div className="mb-5 glass-card border-red-200/60 bg-red-50/60 p-4 text-sm text-red-700 flex items-center gap-2 animate-fade-in-up">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* ─── Stats Row ─── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {[0, 1, 2, 3, 4].map((i) => <SummaryStatSkeleton key={i} />)}
          </div>
        ) : summaries.length > 0 ? (
          <div className="mb-6 animate-fade-in-up animation-delay-100">
            <SummaryStats summaries={summaries} />
          </div>
        ) : null}

        {/* ─── Event Cards ─── */}
        <div className="space-y-4">
          {loading ? (
            [0, 1, 2].map((i) => <EventCardSkeleton key={i} />)
          ) : summaries.length === 0 ? (
            /* Empty State */
            <div className="glass-card p-10 sm:p-16 text-center animate-fade-in-up">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center mb-5 text-brand-primary">
                <BarChartIcon />
              </div>
              <h2 className="text-xl font-bold text-brand-text">No published events yet</h2>
              <p className="text-sm text-brand-muted mt-2 max-w-sm mx-auto">
                Publish an event first to start tracking feedback submissions from participants.
              </p>
            </div>
          ) : (
            summaries.map((s, i) => (
              <EventSummaryCard key={s.event._id} summary={s} index={i} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <ProtectedRoute>
      <FeedbackContent />
    </ProtectedRoute>
  );
}
