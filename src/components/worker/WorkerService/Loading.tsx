import { Skeleton } from "@/components/ui/skeleton"

export function WorkerServicesLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>

      {/* Search and Filters Skeleton */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-[180px]" />
      </div>

      {/* Today's Works Section */}
      <div className="mb-10">
        <Skeleton className="mb-4 h-7 w-48" />
        <div className="space-y-3">
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </div>
      </div>

      {/* Upcoming Works Section */}
      <div>
        <Skeleton className="mb-4 h-7 w-48" />
        <div className="space-y-3">
          <ServiceCardSkeleton />
          <ServiceCardSkeleton />
        </div>
      </div>
    </div>
  )
}

function ServiceCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-64" />
          <div className="flex gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-full sm:w-28" />
      </div>
    </div>
  )
}
