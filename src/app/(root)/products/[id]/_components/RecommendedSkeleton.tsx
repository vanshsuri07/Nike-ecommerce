export function RecommendedSkeleton() {
  return (
    <div className="mt-24">
      <div className="h-8 bg-light-300 rounded w-1/3 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-light-200 rounded-lg">
              <div className="w-full h-64 bg-light-300 rounded-t-lg" />
              <div className="p-4">
                <div className="h-4 bg-light-300 rounded w-3/4" />
                <div className="h-4 bg-light-300 rounded w-1/2 mt-2" />
                <div className="h-6 bg-light-300 rounded w-1/4 mt-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
