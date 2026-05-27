import { Suspense } from "react";
import { DriverDetailData } from "./_components/driver-detail-data";
import { DriverDetailSkeleton } from "./_components/driver-detail-skeleton";

export default function DriverDetailPage(props: { params: Promise<{ driverId: string }> }) {
    return (
        <Suspense fallback={<DriverDetailSkeleton />}>
            <DriverDetailData params={props.params} />
        </Suspense>
    );
}
