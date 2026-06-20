export default function CollectionLoading() {
  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <div className="h-9 w-44 bg-parchment rounded-lg animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-5 bg-card rounded-xl border border-parchment animate-pulse"
          >
            <div className="size-12 rounded-full bg-parchment shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-parchment rounded w-24" />
              <div className="h-3 bg-parchment rounded w-36" />
            </div>
            <div className="space-y-1 shrink-0">
              <div className="h-6 w-6 bg-parchment rounded ml-auto" />
              <div className="h-3 w-8 bg-parchment rounded ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
