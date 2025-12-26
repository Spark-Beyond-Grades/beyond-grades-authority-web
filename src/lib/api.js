export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function authSync(idToken) {
  const res = await fetch(`${API_BASE}/auth/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || "Auth sync failed";
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  return data; // { ok: true, authority: {...} }
}