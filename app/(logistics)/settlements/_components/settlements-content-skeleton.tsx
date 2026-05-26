import { Skeleton } from "@/components/ui/skeleton";

export function SettlementsContentSkeleton() {
    return (
        <>
            <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-paper border border-line rounded-r2 p-5">
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                ))}
            </div>
            <div className="bg-paper border border-line rounded-r2 overflow-hidden">
                <div className="p-5 border-b border-line">
                    <Skeleton className="h-4 w-32" />
                </div>
                {[1, 2, 3].map((row) => (
                    <div key={row} className="flex items-center gap-3 px-6 py-3.5 border-t border-line">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-40 flex-1" />
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        </>
    );
}
