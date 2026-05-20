import type { ShipmentStatus } from "@/lib/shared/shipment-constants";

export interface SellerStatusUpdate {
    order_id: string;
    shipping_id: string;
    status: ShipmentStatus;
    tracking_code: string;
    updated_at: string;
}

export interface SellerNotificationResponse {
    success: boolean;
}

export interface OriginAddress {
    street: string;
    number: string;
    zip: string;
}

export interface OriginAddressResponse {
    origin_address: OriginAddress;
}
