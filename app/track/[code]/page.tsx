import { Suspense } from "react";
import { Metadata } from "next";
import { TrackingDetail } from "./_components/tracking-detail";

export const metadata: Metadata = {
    title: "Seguimiento de envio | UniHousing Shipping",
};

export default async function TrackingPage(props: {
    params: Promise<{ code: string }>
}) {
    const { code } = await props.params;

    return (
        <main className="min-h-screen bg-cream p-4 md:p-8 flex items-start justify-center pt-12">
            <Suspense
                fallback={
                    <div className="bg-paper border border-line rounded-r3 p-6 shadow-sm max-w-4xl w-full">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-bone rounded w-48" />
                            <div className="h-4 bg-bone rounded w-64" />
                            <div className="h-48 bg-bone rounded w-full" />
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-4 bg-bone rounded w-40" />
                                ))}
                            </div>
                        </div>
                    </div>
                }
            >
                <TrackingDetail trackingCode={code} />
            </Suspense>
        </main>
    );
}
