// app/(operator)/dashboard/_components/dashboard-header.tsx
import { Header } from "@/app/(operator)/_components/page-layout";

interface ShipmentDetailsHeaderProps {
    shippingId: string;
    orderId: string;
}

export async function ShipmentDetailsHeader({ shippingId, orderId }: ShipmentDetailsHeaderProps) {

    return (
        <Header
            title={`Envío: ${shippingId}`}
            subtitle={`Orden: ${orderId}`}
        />
    );
}