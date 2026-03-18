import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-brand-surface shadow-sm border border-slate-200 p-6 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h1 className="text-2xl font-semibold text-brand-text">
          Access Denied
        </h1>
        <p className="text-sm text-brand-muted mt-2">
          Your account is not allowlisted for the authority portal. Please
          contact your administrator to request access.
        </p>
        <Link
          href="/login"
          className="inline-block mt-5 rounded-xl border border-slate-200 bg-white text-brand-text font-medium px-5 py-2.5 hover:bg-slate-50 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}