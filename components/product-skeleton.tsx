interface ProductSkeletonProps {
  count?: number
}

export default function ProductSkeleton({ count = 4 }: ProductSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-4">
          <div className="aspect-square rounded-md bg-muted animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

