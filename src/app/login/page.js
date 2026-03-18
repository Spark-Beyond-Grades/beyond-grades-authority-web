"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithMicrosoft } from "@/lib/authMicrosoft";
import { authSync } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleLogin = async () => {
    setMsg(null);
    setLoading(true);

    try {
      const { idToken } = await signInWithMicrosoft();

      // Backend gatekeeper check
      await authSync(idToken);

      // Token is now managed by AuthProvider via onIdTokenChanged
      router.push("/dashboard");
    } catch (e) {
      console.error("Login/Auth error:", e?.message);

      if (e?.status === 403) {
        router.push("/access-denied");
        return;
      }

      setMsg(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-brand-surface shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-brand-text">
          Beyond Grades
        </h1>
        <p className="text-base text-brand-muted mt-0.5">Authority Portal</p>
        <p className="text-sm text-brand-muted mt-3">
          Sign in with your Microsoft account to continue.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-brand-primary text-white font-medium py-3 hover:opacity-95 disabled:opacity-60 transition-opacity"
        >
          {loading ? "Signing in..." : "Continue with Microsoft"}
        </button>

        {msg && (
          <div className="mt-4 text-sm rounded-lg p-3 bg-red-50 border border-red-200 text-red-700">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
