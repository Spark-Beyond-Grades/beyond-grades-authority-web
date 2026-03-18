export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-brand-bg p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-7 w-32 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-4 w-64 rounded-lg bg-slate-100 animate-pulse mt-2" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-10 w-36 rounded-xl bg-slate-200 animate-pulse" />
          </div>
        </div>

        {/* Event card skeletons */}
        <div className="mt-6 grid gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-brand-surface border border-slate-200 p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="h-5 w-48 rounded-lg bg-slate-200 animate-pulse" />
                  <div className="h-4 w-72 rounded-lg bg-slate-100 animate-pulse mt-2" />
                </div>
                <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
