import { Suspense } from "react";
import { Metadata } from "next";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/definitions/auth";
import { PageWrapper, Content } from "../../_components/page-layout";
import { ShipmentDetailData } from "./_components/shipment-detail-data";
import { ShipmentDetailSkeleton } from "./_components/skeletons/shipment-detail-skeleton";

export const metadata: Metadata = {
    title: "Detalle envío | UniHousing Shipping",
    description: "Consulta y gestión detallada del estado, ruta y datos logísticos del envío en la plataforma UniHousing Shipping.",
};

interface ShipmentDetailPageProps {
    params: Promise<{ "shipping-id": string }>;
}

export default async function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
    await requireRole([ROLES.LOGISTICS]);

    const resolvedParams = await params;
    const shippingId = resolvedParams["shipping-id"];

    return (
        <PageWrapper>
            <Suspense fallback={
                <Content className="px-4 lgx:px-7 pb-8">
                    <ShipmentDetailSkeleton />
                </Content>
            }>
                <ShipmentDetailData shippingId={shippingId} />
            </Suspense>
        </PageWrapper>
    );
}