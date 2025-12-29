export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

// ✅ already used by your login flow
export async function authSync(idToken) {
  const res = await fetch(`${API_BASE}/auth/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const msg = data?.message || "Auth sync failed";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data; // { ok: true, authority: {...} }
}

// ✅ TEST: create a draft event
export async function createEvent(idToken, payload = {}) {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const err = new Error(data?.message || "Create event failed");
    err.status = res.status;
    throw err;
  }

  return data; // { ok: true, event: {...} } (or whatever your backend returns)
}

// ✅ TEST: fetch events list
export async function getEvents(idToken) {
  const res = await fetch(`${API_BASE}/events`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const err = new Error(data?.message || "Fetch events failed");
    err.status = res.status;
    throw err;
  }

  return data; // { ok: true, events: [...] }
}

export async function getEventById(idToken, eventId) {
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });

  const data = await safeJson(res);
  if (!res.ok) {
    const err = new Error(data?.message || "Fetch event failed");
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function updateEvent(idToken, eventId, payload) {
  const res = await fetch(`${API_BASE}/events/${eventId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok) {
    const err = new Error(data?.message || "Update event failed");
    err.status = res.status;
    throw err;
  }
  return data;
}