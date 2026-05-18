import { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { getActiveShipments } from "@/lib/db/queries/dashboard";
import { PageWrapper } from "../_components/page-layout";
import { CourierData } from "./_components/courier-data";
import { CourierEmpty } from "./_components/courier-empty";


export const metadata: Metadata = {
    title: "Modo repartidor | UniHousing Shipping",
    description: "Interfaz optimizada para el proceso de entrega activo.",
};


export default async function CourierPage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { userId } = await requireRole([ROLES.LOGISTICS]);
    const params = await props.searchParams;
    const shipments = await getActiveShipments(userId);

    if (shipments.length === 0) {
        return (
            <PageWrapper>
                <CourierEmpty />
            </PageWrapper>
        );
    }

    const trackingFromUrl = params.tracking;
    const initialIndex = trackingFromUrl
        ? shipments.findIndex(s => s.trackingCode === trackingFromUrl)
        : 0;
    const safeIndex = initialIndex >= 0 ? initialIndex : 0;
    const selectedTracking = shipments[safeIndex].trackingCode;

    return (
        <PageWrapper>
            <CourierData
                shipment={shipments[safeIndex]}
                shipments={shipments}
                selectedTracking={selectedTracking}
            />
        </PageWrapper>
    );
}
