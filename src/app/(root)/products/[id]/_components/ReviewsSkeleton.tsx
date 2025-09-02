export function ReviewsSkeleton() {
  return (
    <div className="mt-12">
      <div className="h-8 bg-light-300 rounded w-1/4 mb-8 animate-pulse" />
      <div className="space-y-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse border-b border-light-300 pb-8">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-light-300 rounded-full" />
              <div className="ml-4 flex-1">
                <div className="h-4 bg-light-300 rounded w-24" />
                <div className="flex items-center mt-2">
                    <div className="h-4 w-20 bg-light-300 rounded" />
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
                <div className="h-4 bg-light-300 rounded w-full" />
                <div className="h-4 bg-light-300 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
