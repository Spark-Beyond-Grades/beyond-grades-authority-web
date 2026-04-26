export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Central fetch wrapper — handles auth header, JSON parsing, and error throwing.
 * All API functions delegate to this.
 */
async function apiFetch(path, { token, ...options } = {}) {
  const headers = { ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await safeJson(res);

  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = data;
    throw err;
  }

  return data;
}

// ── Auth ────────────────────────────────────────────────────────────

export const authSync = (token) =>
  apiFetch("/auth/sync", { method: "POST", token });

// ── Events ──────────────────────────────────────────────────────────

export const getEvents = (token) =>
  apiFetch("/events", { token });

export const getEventById = (token, eventId) =>
  apiFetch(`/events/${eventId}`, { token });

export const createEvent = (token, payload) =>
  apiFetch("/events", {
    method: "POST",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const updateEvent = (token, eventId, payload) =>
  apiFetch(`/events/${eventId}`, {
    method: "PUT",
    token,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const publishEvent = (token, eventId) =>
  apiFetch(`/events/${eventId}/publish`, { method: "POST", token });

export const closeEvent = (token, eventId) =>
  apiFetch(`/events/${eventId}/close`, { method: "POST", token });

export async function uploadEventPoster(token, eventId, file) {
  const form = new FormData();
  form.append("poster", file);

  return apiFetch(`/events/${eventId}/poster`, {
    method: "POST",
    token,
    body: form,
  });
}

// ── Participants ────────────────────────────────────────────────────

export const getParticipants = (token, eventId) =>
  apiFetch(`/events/${eventId}/participants`, { token });

export async function uploadParticipantsCsv(token, eventId, file) {
  const form = new FormData();
  form.append("file", file);

  return apiFetch(`/events/${eventId}/participants/upload`, {
    method: "POST",
    token,
    body: form,
  });
}