import { Skeleton } from "@/components/ui/skeleton";

export function ActiveShipmentsListSkeleton() {
    return (
        <section className="bg-paper border border-line rounded-r3 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-line">
                <Skeleton className="h-5 w-40" />
            </div>
            <div className="flex flex-col divide-y divide-line">
                {[1, 2].map((i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                        <div className="flex-1 min-w-0">
                            <Skeleton className="h-4 w-48 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-5 w-16 shrink-0" />
                    </div>
                ))}
            </div>
        </section>
    );
}
