export default function DashboardLoading() {
  return (
    <div className="px-4 sm:px-6 py-8 sm:py-10 max-w-6xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-48 bg-parchment rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-parchment rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-parchment animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-parchment overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-parchment" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-parchment rounded w-3/4" />
              <div className="h-3.5 bg-parchment rounded w-1/2" />
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="size-5 bg-parchment rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
