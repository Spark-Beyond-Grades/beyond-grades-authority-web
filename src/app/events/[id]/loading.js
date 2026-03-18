export default function EventLoading() {
  return (
    <div className="min-h-screen bg-brand-bg p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header skeleton */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-7 w-52 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
            </div>
            <div className="h-4 w-56 rounded-lg bg-slate-100 animate-pulse mt-2" />
          </div>
          <div className="h-10 w-16 rounded-xl bg-slate-200 animate-pulse" />
        </div>

        {/* Form skeleton */}
        <div className="mt-6 rounded-2xl bg-brand-surface border border-slate-200 p-6">
          <div className="grid gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
                <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
