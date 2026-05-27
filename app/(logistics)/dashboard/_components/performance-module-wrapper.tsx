"use client";

import dynamic from "next/dynamic";

const PerformanceModule = dynamic(() => import("./performance-module").then((m) => m.PerformanceModule), {
    ssr: false,
    loading: () => (
        <div className="bg-paper border border-line rounded-r3 p-5 flex flex-col gap-4 animate-pulse">
            <div className="h-4 bg-bone rounded w-24" />
            <div className="space-y-3">
                <div className="h-3 bg-bone rounded w-full" />
                <div className="h-3 bg-bone rounded w-3/4" />
                <div className="h-3 bg-bone rounded w-1/2" />
            </div>
            <div className="h-24 bg-bone rounded w-full" />
        </div>
    ),
});

export function PerformanceModuleWrapper({ data }: { data: Awaited<ReturnType<typeof import("@/lib/db/queries/dashboard").getPerformanceData>> }) {
    return <PerformanceModule data={data} />;
}
