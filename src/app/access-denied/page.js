export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-brand-surface shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-semibold text-brand-text">Access Denied</h1>
        <p className="text-sm text-brand-muted mt-2">
          Your account is not allowlisted for the authority portal.
        </p>
      </div>
    </div>
  );
}