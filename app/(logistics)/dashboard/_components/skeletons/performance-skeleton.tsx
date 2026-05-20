import { Skeleton } from "@/components/ui/skeleton";

export function PerformanceSkeleton() {
    return (
        <div className="bg-paper border border-line rounded-r3 p-5 flex flex-col gap-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-[120px] w-full rounded-r2" />
        </div>
    );
}
