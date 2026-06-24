// lib/definitions/api-contracts.ts
import type { ShippingStatus } from "@/lib/schemas/domain";

/**
 * Contrato: POST /api/buyer/ordenes/:order_id/estado-envio
 * Según documento 03-apis.md
 */
export interface BuyerNotificationRequest {
    shipping_id: string;
    status: ShippingStatus;
    tracking_code: string;
    updated_at: string; // ISO 8601
}

/**
 * Contrato: POST /api/shipping/shipments
 */
export interface CreateShipmentRequest {
    order_id: string;
    seller_id: string;
    buyer_id: string;
}