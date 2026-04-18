export default function ExploreLoading() {
  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <div className="mb-6 space-y-1">
        <div className="h-9 w-32 bg-parchment rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-parchment rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-parchment overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-parchment" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-parchment rounded w-3/4" />
              <div className="h-3.5 bg-parchment rounded w-1/2" />
              <div className="h-4 bg-parchment rounded w-20 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
