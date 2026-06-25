export default function ProfileLoading() {
  return (
    <div className="px-4 sm:px-6 py-8 sm:py-10 max-w-2xl mx-auto">
      <div className="flex items-start gap-4 mb-6">
        <div className="size-20 rounded-full bg-parchment animate-pulse shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-7 w-40 bg-parchment rounded-lg animate-pulse" />
          <div className="h-4 w-24 bg-parchment rounded animate-pulse" />
          <div className="h-3.5 w-56 bg-parchment rounded animate-pulse" />
        </div>
      </div>
      <div className="flex gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-7 w-10 bg-parchment rounded animate-pulse" />
            <div className="h-3 w-14 bg-parchment rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-parchment overflow-hidden animate-pulse"
          >
            <div className="aspect-video bg-parchment" />
            <div className="p-4 space-y-2">
              <div className="h-5 bg-parchment rounded w-3/4" />
              <div className="h-3.5 bg-parchment rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
