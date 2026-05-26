// app/(operator)/dashboard/_components/dashboard-header.tsx
import { Header } from "@/app/(logistics)/_components/page-layout";

interface ShipmentDetailsHeaderProps {
    shippingId: string;
    trackingCode: string;
    action?: React.ReactNode;
}

export async function ShipmentDetailsHeader({ shippingId, trackingCode, action }: ShipmentDetailsHeaderProps) {

    return (
        <Header
            title={`Envío: ${shippingId}`}
            subtitle={`Código: ${trackingCode}`}
            action={action}
        />
    );
}