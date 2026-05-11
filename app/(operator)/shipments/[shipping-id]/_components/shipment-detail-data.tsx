import { getShipmentDetails } from "@/lib/db/queries/shipments.queries";
import { notFound } from "next/navigation";
import { Content } from "../../../_components/page-layout";
import { ShipmentDetailsHeader } from "./shipment-details-header";
import { ShipmentMapPlaceholder } from "./shipment-map-placeholder";
import { RouteInfo } from "./route-info";
import { PaymentInfo } from "./payment-info";
import { BuyerInfo } from "./buyer-info";
import { PackageInfo } from "./package-info";

interface ShipmentDetailDataProps {
    shippingId: string;
}

export async function ShipmentDetailData({ shippingId }: ShipmentDetailDataProps) {
    const shipment = await getShipmentDetails(shippingId);

    if (!shipment) {
        notFound();
    }

    return (
        <>
            <ShipmentDetailsHeader
                shippingId={shipment.shippingId}
                orderId={shipment.orderId}
            />
            <Content className="px-4 lgx:px-7 pb-8">
                <div className="grid gap-4 grid-cols-1 min-[901px]:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
                    <div className="flex flex-col gap-4">
                        <ShipmentMapPlaceholder
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
        </>
    );
}
