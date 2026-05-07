import { ShippingStatus } from "@/lib/definitions/shipment";

export interface BuyerStatusUpdate {
    shipping_id: string;
    status: ShippingStatus;
    tracking_code: string;
    updated_at: string;
}

export interface BuyerNotificationResponse {
    received: boolean;
    order_id: string;
}
