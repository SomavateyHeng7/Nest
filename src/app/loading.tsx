import { Skeleton } from "@/shared/ui/skeleton";

// Root fallback: gives every route without its own loading.tsx an instant shell (and makes <Link> prefetch useful).
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-24 sm:px-6" role="status" aria-busy="true">
      <Skeleton className="h-9 w-64 max-w-full" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
