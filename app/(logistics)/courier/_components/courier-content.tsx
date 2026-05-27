import { getActiveShipments } from "@/lib/db/queries/dashboard";
import { getAuthContext } from "@/lib/auth/context";
import { getInternalUserId } from "@/lib/auth/get-internal-user-id";
import { CourierData } from "./courier-data";
import { CourierEmpty } from "./courier-empty";

interface CourierContentProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function CourierContent({ searchParams }: CourierContentProps) {
    const { clerkUserId } = await getAuthContext();
    if (!clerkUserId) return null;
    const user = await getInternalUserId(clerkUserId);
    if (!user) return null;

    const shipments = await getActiveShipments(user.id);

    if (shipments.length === 0) {
        return <CourierEmpty />;
    }

    const params = await searchParams;
    const trackingFromUrl = params.tracking;
    const initialIndex = trackingFromUrl
        ? shipments.findIndex(s => s.trackingCode === trackingFromUrl)
        : 0;
    const safeIndex = initialIndex >= 0 ? initialIndex : 0;
    const selectedTracking = shipments[safeIndex].trackingCode;

    return (
        <CourierData
            shipment={shipments[safeIndex]}
            shipments={shipments}
            selectedTracking={selectedTracking}
        />
    );
}
