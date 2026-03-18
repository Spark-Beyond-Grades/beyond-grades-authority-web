import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-brand-surface shadow-sm border border-slate-200 p-6 text-center">
        <div className="text-5xl font-bold text-brand-primary mb-2">404</div>
        <h1 className="text-xl font-semibold text-brand-text">
          Page Not Found
        </h1>
        <p className="text-sm text-brand-muted mt-2">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-5 rounded-xl bg-brand-primary text-white font-medium px-5 py-2.5 hover:opacity-95 transition-opacity"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
