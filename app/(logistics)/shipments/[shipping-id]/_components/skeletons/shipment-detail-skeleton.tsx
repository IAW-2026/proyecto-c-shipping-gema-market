import { Skeleton } from "@/components/ui/skeleton";

function InfoCardSkeleton() {
    return (
        <div className="bg-paper border border-line rounded-[22px] p-5">
            <Skeleton className="h-3 w-24 mb-4" />
            <Skeleton className="h-6 w-32" />
        </div>
    );
}

export function ShipmentDetailSkeleton() {
    return (
        <div className="grid gap-4 grid-cols-1 min-[901px]:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] h-full">
            <div className="flex flex-col gap-4">
                <div className="bg-paper border border-line rounded-[22px] overflow-hidden flex-1">
                    <Skeleton className="h-full min-h-[280px] w-full" />
                </div>
                <div className="bg-paper border border-line rounded-[22px] p-5">
                    <Skeleton className="h-4 w-12 mb-4" />
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3.5">
                            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                            <div className="flex-1">
                                <Skeleton className="h-3 w-32 mb-1" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                        <div className="flex gap-3.5">
                            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                            <div className="flex-1">
                                <Skeleton className="h-3 w-32 mb-1" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <InfoCardSkeleton />
                <InfoCardSkeleton />
                <InfoCardSkeleton />
            </div>
        </div>
    );
}
