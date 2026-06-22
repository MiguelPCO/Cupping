export default function OriginLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="h-8 w-24 bg-linen rounded-lg animate-pulse mb-4" />
      <div className="h-4 w-16 bg-linen rounded animate-pulse mb-1" />
      <div className="h-9 w-48 bg-linen rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-linen rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
