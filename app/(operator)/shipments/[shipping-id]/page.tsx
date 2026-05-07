import { Metadata } from "next";
import { getShipmentDetails } from "@/lib/db/queries/shipments.queries";
import { ShipmentDetailsHeader } from "./_components/shipment-details-header"
import { notFound } from "next/navigation";
import { PageWrapper } from "../../_components/page-layout";

export const metadata: Metadata = {
    title: "Detalle envío | UniHousing Shipping",
    description: "Consulta y gestión detallada del estado, ruta y datos logísticos del envío en la plataforma UniHousing Shipping.",
};

interface Props {
    params: { "shipping-id": string };
}
export default async function ShipmentDetailPage({ params }: Props) {
    // Obtenemos el ID de la URL
    const shippingIdFromUrl = params["shipping-id"];

    // Llamamos a la función de mock
    const shipment = await getShipmentDetails(shippingIdFromUrl);

    // Si el envío no existe, disparamos el not-found de Next.js
    if (!shipment) {
        notFound();
    }

    return (
        <PageWrapper>
            <ShipmentDetailsHeader
                shippingId={shipment.shippingId}
                orderId={shipment.orderId}
            />
        </PageWrapper>
    );

}