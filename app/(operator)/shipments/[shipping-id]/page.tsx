import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getShipmentDetails } from "@/lib/db/queries/shipments.queries";
import { ROLES, UserRole } from "@/lib/shared/auth-constants";
import { PageWrapper, Content } from "../../_components/page-layout";
import { ShipmentDetailsHeader } from "./_components/shipment-details-header";
import { ShipmentMapPlaceholder } from "./_components/shipment-map-placeholder";
import { RouteInfo } from "./_components/route-info";
import { PaymentInfo } from "./_components/payment-info";
import { BuyerInfo } from "./_components/buyer-info";
import { PackageInfo } from "./_components/package-info";

export const metadata: Metadata = {
    title: "Detalle envío | UniHousing Shipping",
    description: "Consulta y gestión detallada del estado, ruta y datos logísticos del envío en la plataforma UniHousing Shipping.",
};

interface ShipmentDetailPageProps {
    params: Promise<{ "shipping-id": string }>;
}

export default async function ShipmentDetailPage({ params }: ShipmentDetailPageProps) {
    // 1. Verificación de Identidad y Roles
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const metadata = sessionClaims?.metadata as { role?: UserRole } | undefined;
    const userRole = metadata?.role;

    if (userRole !== ROLES.LOGISTICS && userRole !== ROLES.ADMIN) {
        redirect("/unauthorized");
    }

    // 2. Parámetros y Obtención de Datos
    const resolvedParams = await params;
    const shippingIdFromUrl = resolvedParams["shipping-id"];

    const shipment = await getShipmentDetails(shippingIdFromUrl);

    if (!shipment) {
        notFound();
    }

    // 3. Renderizado de la página
    return (
        <PageWrapper>
            {/* Componente de encabezado mantenido sin modificaciones */}
            <ShipmentDetailsHeader
                shippingId={shipment.shippingId}
                orderId={shipment.orderId}
            />

            <Content className="px-4 lgx:px-7 pb-8">
                <div className="grid gap-4 grid-cols-1 min-[901px]:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                    {/* Columna Izquierda (Mapa y Ruta) */}
                    <div className="flex flex-col gap-4">
                        <ShipmentMapPlaceholder
                            distance={shipment.distance || 0}
                            status={shipment.status}
                        />
                        <RouteInfo
                            pickupAddress={shipment.pickupAddress}
                            deliveryAddress={shipment.deliveryAddress}
                        />
                        {/* Se eliminó completamente la sección de "Acciones rápidas" */}
                    </div>

                    {/* Columna Derecha (Información adicional) */}
                    <div className="flex flex-col gap-4">
                        <PaymentInfo price={shipment.price} />
                        <BuyerInfo buyerName={shipment.buyerName} />
                        <PackageInfo
                            weight={shipment.weight}
                            height={shipment.height}
                            width={shipment.width}
                            depth={shipment.depth}
                            orderId={shipment.orderId}
                        />
                    </div>
                </div>
            </Content>
        </PageWrapper>
    );
}