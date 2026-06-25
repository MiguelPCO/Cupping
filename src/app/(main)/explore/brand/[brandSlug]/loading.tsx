export default function BrandLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="h-8 w-24 bg-linen rounded-lg animate-pulse mb-4" />
      <div className="h-4 w-16 bg-linen rounded animate-pulse mb-1" />
      <div className="h-9 w-56 bg-linen rounded animate-pulse mb-4" />
      <div className="flex gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-4 w-20 bg-linen rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-linen rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
