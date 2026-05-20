import type { ShipmentStatus } from "@/lib/shared/shipment-constants";

export interface BuyerStatusUpdate {
    shipping_id: string;
    status: ShipmentStatus;
    tracking_code: string;
    updated_at: string;
}

export interface BuyerNotificationResponse {
    received: boolean;
    order_id: string;
}

export interface BuyerAddress {
    zip: string;
    number: string;
    street: string;
}

export interface BuyerDataResponse {
    id: string;
    email: string;
    full_name: string;
    phone_number: string;
    address: BuyerAddress;
    created_at: string;
}
