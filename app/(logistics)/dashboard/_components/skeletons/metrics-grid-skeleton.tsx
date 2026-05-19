import { Skeleton } from "@/components/ui/skeleton";

export function MetricsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-paper p-5 rounded-[26px] border border-ink flex flex-col justify-center">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-8 w-20" />
                </div>
            ))}
        </div>
    );
}
