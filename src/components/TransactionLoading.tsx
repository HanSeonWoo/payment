import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionLoading() {
  return (
    <div>
      {[...Array(10)].map((_, index) => (
        <div key={index} className="flex items-center p-4">
          <div className="flex flex-1 items-center space-x-4">
            <Skeleton className="size-10 rounded" />
            <div className="flex flex-1 flex-col pr-2">
              <Skeleton className="mb-2 h-4 w-full rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          </div>

          <div className="flex flex-shrink flex-col items-end">
            <Skeleton className="mb-2 h-4 w-16 rounded" />
            <Skeleton className="h-3 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
