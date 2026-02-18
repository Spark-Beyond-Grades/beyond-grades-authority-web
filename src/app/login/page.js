"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithMicrosoft } from "@/lib/authMicrosoft";
import { authSync} from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleLogin = async () => {
    setMsg(null);
    setLoading(true);

    try {
      const { user, idToken } = await signInWithMicrosoft();

      // ✅ Backend gatekeeper check
      await authSync(idToken);

      // ✅ store token for dashboard/api calls
      localStorage.setItem("bg_id_token", idToken);

      // redirect to dashboard
      router.push("/dashboard");
    } catch (e) {
      console.log("❌ Login/Auth error:", e?.message);

      if (e?.status === 403) {
        router.push("/access-denied");
        return;
      }

      setMsg(`❌ ${e?.message || "Login failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-brand-surface shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-brand-text">
          Beyond Grades — Authority Portal
        </h1>
        <p className="text-sm text-brand-muted mt-1">
          Sign in with Microsoft to continue.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-brand-primary text-white font-medium py-3 hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Continue with Microsoft"}
        </button>

        {msg && (
          <div className="mt-4 text-sm rounded-lg p-3 bg-slate-50 border border-slate-200 text-brand-text">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
