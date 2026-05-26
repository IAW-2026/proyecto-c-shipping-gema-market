import { getShipmentDetails } from "@/lib/db/queries/shipment";
import { notFound } from "next/navigation";
import { Content } from "../../../_components/page-layout";
import { ShipmentDetailsHeader } from "./shipment-details-header";
import { TakeShipmentAction } from "./take-shipment-action";
import { ShipmentMap } from "./shipment-map";
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
                trackingCode={shipment.trackingCode}
                action={
                    shipment.status === "waiting_for_courier"
                        ? <TakeShipmentAction shippingId={shipment.shippingId} />
                        : undefined
                }
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
