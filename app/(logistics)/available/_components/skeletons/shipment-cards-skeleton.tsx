import { Skeleton } from "@/components/ui/skeleton";

function ShipmentCardSkeleton() {
    return (
        <div className="bg-paper border border-line rounded-[22px] p-5 flex flex-col gap-5">
            <div className="flex justify-between items-start">
                <div>
                    <Skeleton className="h-3 w-28 mb-2" />
                    <Skeleton className="h-7 w-20" />
                </div>
            </div>
            <div className="bg-cream p-4 rounded-[16px] flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                    <Skeleton className="h-4 flex-1" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                    <Skeleton className="h-4 flex-1" />
                </div>
            </div>
            <div className="flex gap-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
            </div>
            <div className="pt-4 border-t border-line flex gap-4">
                <Skeleton className="h-11 flex-1 rounded-full" />
                <Skeleton className="h-11 flex-1 rounded-full" />
            </div>
        </div>
    );
}

export function ShipmentCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <ShipmentCardSkeleton key={i} />
            ))}
        </div>
    );
}
