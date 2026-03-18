"use client";

export default function GlobalError({ error, reset }) {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-brand-surface shadow-sm border border-slate-200 p-6 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <h1 className="text-xl font-semibold text-brand-text">
          Something went wrong
        </h1>
        <p className="text-sm text-brand-muted mt-2">
          {error?.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => reset()}
          className="mt-5 rounded-xl bg-brand-primary text-white font-medium px-5 py-2.5 hover:opacity-95 transition-opacity"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
