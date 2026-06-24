import { getShipmentDetails } from "@/lib/db/queries/logistics/shipments";
import { notFound } from "next/navigation";
import { Content } from "../../../_components/page-layout";
import { ShipmentDetailsHeader } from "./shipment-details-header";
import { ShipmentDetailAction } from "./shipment-detail-action";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/types/auth";
import { COURIER_ACTION_MAP } from "@/lib/constants/shipment";
import { ShipmentMap } from "./shipment-map";
import { RouteInfo } from "./route-info";
import { PaymentInfo } from "./payment-info";
import { BuyerInfo } from "./buyer-info";
import { PackageInfo } from "./package-info";


interface ShipmentDetailDataProps {
    params: Promise<{ "shipping-id": string }>;
}

export async function ShipmentDetailData({ params }: ShipmentDetailDataProps) {
    const { userId } = await requireRole([ROLES.LOGISTICS]);
    const resolvedParams = await params;
    const shippingId = resolvedParams["shipping-id"];
    const shipment = await getShipmentDetails(shippingId);

    if (!shipment) {
        notFound();
    }

    const action = (() => {
        if (shipment.status === "delivered") return undefined;

        if (shipment.status === "waiting_for_courier") {
            return (
                <ShipmentDetailAction
                    shippingId={shipment.shippingId}
                    label="Tomar envío"
                    mode="take"
                />
            );
        }

        if (shipment.logisticsId !== userId) return undefined;

        const actionConfig = COURIER_ACTION_MAP[shipment.status];
        if (!actionConfig) return undefined;

        return (
            <ShipmentDetailAction
                shippingId={shipment.shippingId}
                label={actionConfig.label}
                mode="transition"
                transition={actionConfig.transition}
            />
        );
    })();

    return (
        <>
            <ShipmentDetailsHeader
                shippingId={shipment.shippingId}
                trackingCode={shipment.trackingCode}
                action={action}
            />
            <Content className="px-4 lgx:px-7 pb-8">
                <div className="grid gap-4 grid-cols-1 min-[901px]:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] h-full">
                    <div className="flex flex-col gap-4">
                        <ShipmentMap
                            shippingId={shipment.shippingId}
                            distance={shipment.distance || 0}
                            status={shipment.status}
                        />
                        <RouteInfo
                            pickupAddress={shipment.pickupAddress}
                            deliveryAddress={shipment.deliveryAddress}
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <PaymentInfo price={shipment.price} />
                        <BuyerInfo buyerName={shipment.buyerName} buyerPhone={shipment.receiverPhone} />
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
        </>
    );
}
