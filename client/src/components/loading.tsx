import { Skeleton } from "@/components/ui/skeleton";

export function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 text-center">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  );
}
