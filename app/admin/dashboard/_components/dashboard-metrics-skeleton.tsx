import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboardMetricsSkeleton() {
    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-paper border border-line rounded-r2 p-5 flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                        <div>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-paper border border-line rounded-r2 p-5">
                    <Skeleton className="h-4 w-32 mb-3" />
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-40" />
                </div>
                <div className="bg-paper border border-line rounded-r2 p-5 lg:col-span-2">
                    <Skeleton className="h-4 w-28 mb-3" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i}>
                                <div className="flex justify-between mb-1">
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-3 w-6" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
