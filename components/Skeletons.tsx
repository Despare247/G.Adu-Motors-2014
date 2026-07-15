export function PartCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-ink-800 bg-ink-900">
      <div className="aspect-[4/3] w-full animate-pulse bg-ink-800" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-ink-800" />
        <div className="h-4 w-full animate-pulse rounded bg-ink-800" />
        <div className="h-3 w-24 animate-pulse rounded bg-ink-800" />
        <div className="mt-2 h-6 w-20 animate-pulse rounded bg-ink-800" />
        <div className="mt-3 h-9 w-full animate-pulse rounded-lg bg-ink-800" />
        <div className="h-9 w-full animate-pulse rounded-lg bg-ink-800" />
      </div>
    </div>
  );
}

export function InventoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PartCardSkeleton key={i} />
      ))}
    </div>
  );
}
