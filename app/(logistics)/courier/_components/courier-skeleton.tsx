export function CourierSkeleton() {
    return (
        <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="animate-pulse space-y-4 w-full max-w-md">
                <div className="h-8 bg-bone rounded w-3/4" />
                <div className="h-4 bg-bone rounded w-1/2" />
                <div className="h-48 bg-bone rounded w-full" />
            </div>
        </div>
    );
}
