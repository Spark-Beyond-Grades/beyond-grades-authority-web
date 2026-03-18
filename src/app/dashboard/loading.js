/**
 * Next.js route-level loading skeleton for /dashboard.
 * Matches the new dashboard layout: hero, stats row, event cards.
 * Uses shimmer gradient animation for a premium feel.
 */
export default function DashboardLoading() {
  return (
    <div className="bg-mesh">
      {/* Nav skeleton */}
      <div className="glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="shimmer w-8 h-8 rounded-lg" />
            <div className="shimmer w-28 h-5" />
          </div>
          <div className="flex items-center gap-3">
            <div className="shimmer w-36 h-4 hidden sm:block" />
            <div className="shimmer w-8 h-8 rounded-full" />
            <div className="shimmer w-20 h-8 rounded-xl" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero skeleton */}
        <div>
          <div className="shimmer h-8 w-64 sm:w-80" />
          <div className="shimmer h-5 w-56 mt-2" />
        </div>

        {/* Stats row skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5">
              <div className="shimmer h-3 w-16 mb-3" />
              <div className="shimmer h-8 w-12" />
            </div>
          ))}
        </div>

        {/* Section header skeleton */}
        <div className="flex items-center justify-between gap-4 mt-8 mb-4">
          <div className="shimmer h-6 w-32" />
          <div className="flex gap-2">
            <div className="shimmer h-9 w-24 rounded-xl" />
            <div className="shimmer h-9 w-32 rounded-xl" />
          </div>
        </div>

        {/* Event card skeletons */}
        <div className="grid gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card p-5"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="shimmer h-5 w-3/5" />
                  <div className="shimmer h-3 w-16 rounded-md" />
                  <div className="flex gap-3 mt-1">
                    <div className="shimmer h-3 w-28" />
                    <div className="shimmer h-3 w-28" />
                  </div>
                </div>
                <div className="shimmer h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
