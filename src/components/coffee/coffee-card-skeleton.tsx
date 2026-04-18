export function CoffeeCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-parchment overflow-hidden animate-pulse">
      {/* Photo area */}
      <div className="aspect-video bg-parchment" />
      <div className="p-4 space-y-3">
        {/* Name + brand */}
        <div className="space-y-1.5">
          <div className="h-5 bg-parchment rounded w-3/4" />
          <div className="h-3.5 bg-parchment rounded w-1/2" />
        </div>
        {/* Rating */}
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="size-5 bg-parchment rounded" />
          ))}
        </div>
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 bg-parchment rounded-full w-20" />
          <div className="h-6 bg-parchment rounded-full w-16" />
          <div className="h-6 bg-parchment rounded-full w-14" />
        </div>
        {/* Brew + notes */}
        <div className="h-3.5 bg-parchment rounded w-28" />
        <div className="h-3 bg-parchment rounded w-full" />
      </div>
    </div>
  );
}
