export function CoffeeCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando café"
      className="bg-card rounded-xl overflow-hidden animate-pulse"
    >
      <div className="aspect-[4/3] bg-parchment" />
      <div className="p-3.5 space-y-2.5">
        <div className="space-y-1.5">
          <div className="h-3 bg-parchment rounded w-1/2" />
          <div className="h-5 bg-parchment rounded w-3/4" />
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="size-5 bg-parchment rounded" />
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-5 bg-parchment rounded-full w-16" />
          <div className="h-5 bg-parchment rounded-full w-14" />
        </div>
      </div>
    </div>
  );
}
