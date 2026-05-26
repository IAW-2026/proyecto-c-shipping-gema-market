import { Suspense } from "react";
import { DriverDetailData } from "./_components/driver-detail-data";
import { DriverDetailSkeleton } from "./_components/driver-detail-skeleton";

export default async function DriverDetailPage(props: { params: Promise<{ driverId: string }> }) {
    const { driverId } = await props.params;

    return (
        <Suspense fallback={<DriverDetailSkeleton />}>
            <DriverDetailData driverId={driverId} />
        </Suspense>
    );
}
