"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
      await authSync(idToken);
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
    <div className="min-h-screen bg-brand-bg flex flex-col lg:flex-row">
      {/* ── Left Hero Panel ── */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-primary to-[#0C8B8A]">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-10 w-40 h-40 rounded-full bg-brand-secondary/10" />

        {/* Content */}
        <div className="relative z-10 max-w-md px-12 text-center">
          <div className="animate-float">
            <Image
              src="/beyond_grades_logo.png"
              alt="Beyond Grades Logo"
              width={140}
              height={140}
              className="mx-auto drop-shadow-2xl"
              priority
            />
          </div>

          <h2 className="mt-8 text-4xl font-bold text-white leading-tight">
            Beyond Grades
          </h2>
          <p className="mt-3 text-lg text-white/80 font-light">
            Tracking Growth Beyond Grades
          </p>

          {/* Feature highlights */}
          <div className="mt-10 space-y-4 text-left">
            {[
              { icon: "📊", text: "Create & Manage Events" },
              { icon: "👥", text: "Organize team structures" },
              { icon: "⚡", text: "Publish events in real-time" },
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3"
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm text-white/90 font-medium">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Login Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo — shown only on small screens */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Image
              src="/beyond_grades_logo.png"
              alt="Beyond Grades Logo"
              width={80}
              height={80}
              className="drop-shadow-lg"
              priority
            />
            <h1 className="mt-4 text-2xl font-bold text-brand-text">
              Beyond Grades
            </h1>
            <p className="text-sm text-brand-muted">
              Tracking Growth Beyond Grades
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl bg-white border border-brand-stroke shadow-lg shadow-black/5 overflow-hidden">
            {/* Gradient accent bar */}
            <div className="h-1.5 bg-gradient-to-r from-brand-primary via-brand-accent to-brand-secondary" />

            <div className="p-8">
              {/* Desktop heading */}
              <div className="hidden lg:block">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-brand-text">
                      Welcome back
                    </h1>
                    <p className="text-sm text-brand-muted">
                      Authority Portal
                    </p>
                  </div>
                </div>
                <p className="text-sm text-brand-muted mt-3">
                  Sign in with your institutional Microsoft account to access the event management dashboard.
                </p>
              </div>

              {/* Mobile heading */}
              <div className="lg:hidden text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-brand-text">
                  Authority Portal
                </h2>
                <p className="text-sm text-brand-muted mt-1">
                  Sign in to manage your events
                </p>
              </div>

              {/* Divider with text */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-brand-stroke" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs font-medium text-brand-muted uppercase tracking-wider">
                    Secure Sign In
                  </span>
                </div>
              </div>

              {/* Microsoft Login Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="group w-full flex items-center justify-center gap-3 rounded-xl bg-brand-primary text-white font-semibold py-4 px-4
                  hover:bg-brand-primary-dark hover:shadow-lg hover:shadow-brand-primary/30
                  active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-md shadow-brand-primary/20"
              >
                {/* Microsoft icon */}
                {!loading && (
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center transition-transform group-hover:scale-105">
                    <svg
                      className="w-4.5 h-4.5"
                      viewBox="0 0 21 21"
                      fill="none"
                    >
                      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                    </svg>
                  </div>
                )}

                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Continue with Microsoft"
                )}
              </button>

              {/* Trust indicators */}
              <div className="mt-5 flex items-center justify-center gap-4 text-brand-muted">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span className="text-xs">Encrypted</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-brand-stroke" />
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                  <span className="text-xs">SSO</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-brand-stroke" />
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                  <span className="text-xs">Institutional</span>
                </div>
              </div>

              {/* Error message */}
              {msg && (
                <div className="mt-5 text-sm rounded-xl p-4 bg-red-50 border border-red-200 text-red-700 animate-fade-in-up">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span>{msg}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-brand-muted">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span>Only authorized institutional accounts can access this portal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
