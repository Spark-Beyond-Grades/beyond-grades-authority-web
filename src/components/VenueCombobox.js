"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE } from "@/lib/api";

/* ─── Venue Suggestions (common college venue names as seed) ─── */
const COMMON_VENUES = [
  "Main Auditorium",
  "Mini Auditorium",
  "Seminar Hall",
  "Conference Room",
  "Open Air Amphitheatre",
  "Sports Ground",
  "Basketball Court",
  "Multipurpose Hall",
  "Library Block",
  "Computer Lab",
  "Cafeteria",
  "Admin Block",
  "Block A",
  "Block B",
  "Block C",
  "Central Lawn",
  "College Grounds",
];

const LocationIcon = () => (
  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ChevronDown = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 text-brand-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export default function VenueCombobox({ value, onChange, disabled }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Sync external value → local input ── */
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  /* ── Filter local suggestions based on query ── */
  const getLocal = useCallback((q) => {
    if (!q.trim()) return COMMON_VENUES.slice(0, 8);
    return COMMON_VENUES.filter((v) =>
      v.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 8);
  }, []);

  /* ── Fetch from backend universities/venues search ── */
  useEffect(() => {
    const local = getLocal(query);
    setSuggestions(local);

    if (!query.trim()) return;

    // Debounce backend search
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/universities/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        const remote = (data.items || []).map((u) => u.name);
        // Merge: remote first, then local ones not already in remote
        const merged = [
          ...remote,
          ...local.filter((l) => !remote.some((r) => r.toLowerCase() === l.toLowerCase())),
        ].slice(0, 10);
        setSuggestions(merged);
      } catch {
        // silently fallback to local
        setSuggestions(local);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, getLocal]);

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (venue) => {
    setQuery(venue);
    onChange(venue);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setOpen(true);
  };

  const handleFocus = () => {
    if (!disabled) setOpen(true);
  };

  /* ── Custom entry at top if query doesn't exactly match ── */
  const showCustomEntry =
    query.trim().length > 0 &&
    !suggestions.some((s) => s.toLowerCase() === query.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary">
          <LocationIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Search or type a venue..."
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 py-2 text-brand-text outline-none focus:ring-2 focus:ring-brand-accent disabled:opacity-60 disabled:bg-slate-50 transition-shadow"
          autoComplete="off"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <ChevronDown />
        </button>
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="venue-dropdown">
          {/* Custom / typed entry */}
          {showCustomEntry && (
            <button
              type="button"
              onClick={() => handleSelect(query.trim())}
              className="venue-option venue-option-custom"
            >
              <span className="text-brand-primary text-sm">+</span>
              <span>
                Use &quot;<strong>{query.trim()}</strong>&quot;
              </span>
            </button>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <>
              {showCustomEntry && <div className="venue-divider" />}
              <p className="venue-section-label">Suggestions</p>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className={`venue-option ${
                    s.toLowerCase() === query.toLowerCase() ? "venue-option-active" : ""
                  }`}
                >
                  <LocationIcon />
                  <span className="flex-1 text-left">{s}</span>
                  {s.toLowerCase() === query.toLowerCase() && <CheckIcon />}
                </button>
              ))}
            </>
          )}

          {suggestions.length === 0 && !showCustomEntry && (
            <p className="text-center text-sm text-slate-400 py-4">
              No venues found. Type to add a custom one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
