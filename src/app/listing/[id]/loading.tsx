import { Skeleton } from "@/shared/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-28 sm:px-6" role="status" aria-busy="true">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-5 h-3 w-16" />
      <Skeleton className="mt-3 h-9 w-3/4" />
      <Skeleton className="mt-3 h-4 w-60 max-w-full" />
      <Skeleton className="mt-6 -mx-4 aspect-4/3 rounded-none sm:mx-0 sm:aspect-auto sm:h-[440px] sm:rounded-3xl" />
      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid grid-cols-2 gap-3 self-start sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
        <Skeleton className="hidden h-[520px] rounded-2xl lg:block" />
      </div>
    </div>
  );
}
