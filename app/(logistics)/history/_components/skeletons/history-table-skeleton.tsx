import { Skeleton } from "@/components/ui/skeleton";

export function HistoryTableSkeleton() {
    return (
        <div>
            <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-9 w-24 rounded-full" />
                ))}
            </div>
            <div className="bg-paper border border-line rounded-r3 overflow-hidden shadow-sm">
                <div className="hidden lgx:block">
                    <div className="flex px-4 py-3 border-b border-line gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-4 flex-1" />
                        ))}
                    </div>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex px-4 py-4 border-b border-line gap-4">
                            {[1, 2, 3, 4, 5].map((j) => (
                                <Skeleton key={j} className="h-4 flex-1" />
                            ))}
                        </div>
                    ))}
                </div>
                <div className="lgx:hidden p-4 flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-5 flex-1" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
