import { Suspense } from "react";
import { Metadata } from "next";
import { TrackingData } from "./_components/tracking-data";

export const metadata: Metadata = {
    title: "Seguimiento de envío | UniHousing Shipping",
};

export default async function TrackingPage(props: {
    params: Promise<{ id: string }>
}) {
    const { id } = await props.params;

    return (
        <main className="min-h-screen bg-cream p-4 md:p-8 flex items-start justify-center pt-12">
            <Suspense
                fallback={
                    <div className="bg-paper border border-line rounded-r3 p-6 shadow-sm max-w-lg w-full">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 bg-bone rounded w-48" />
                            <div className="h-4 bg-bone rounded w-64" />
                            <div className="space-y-3 pt-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-bone shrink-0" />
                                        <div className="h-4 bg-bone rounded w-40" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                }
            >
                <TrackingData shippingId={id} />
            </Suspense>
        </main>
    );
}
