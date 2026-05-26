import type { ShipmentStatus } from "@/lib/shared/shipment-constants";
import { sellerApiClient } from "@/lib/clients/seller-api/seller-api.client";
import { buyerApiClient } from "@/lib/clients/buyer-api/buyer-api.client";
import type { SellerStatusUpdate } from "@/lib/clients/seller-api/seller-api.types";
import type { BuyerStatusUpdate } from "@/lib/clients/buyer-api/buyer-api.types";

interface NotificationPayload {
    orderId: string;
    shippingId: string;
    trackingCode: string;
    oldStatus: ShipmentStatus;
    newStatus: ShipmentStatus;
}

async function notifySeller(orderId: string, payload: SellerStatusUpdate) {
    try {
        await sellerApiClient.notifyStatusChange(orderId, payload);
    } catch (error) {
        console.error("[NOTIFICATION] Error notificando a Seller:", error);
    }
}

async function notifyBuyer(orderId: string, payload: BuyerStatusUpdate) {
    try {
        await buyerApiClient.notifyStatusChange(orderId, payload);
    } catch (error) {
        console.error("[NOTIFICATION] Error notificando a Buyer:", error);
    }
}

function buildPayload(p: NotificationPayload) {
    const updated_at = new Date().toISOString();
    const sellerPayload: SellerStatusUpdate = {
        order_id: p.orderId,
        shipping_id: p.shippingId,
        status: p.newStatus,
        tracking_code: p.trackingCode,
        updated_at,
    };
    const buyerPayload: BuyerStatusUpdate = {
        shipping_id: p.shippingId,
        status: p.newStatus,
        tracking_code: p.trackingCode,
        updated_at,
    };
    return { sellerPayload, buyerPayload };
}

export async function notifyTransition(payload: NotificationPayload) {
    const { orderId, oldStatus, newStatus, shippingId } = payload;
    const { sellerPayload, buyerPayload } = buildPayload(payload);

    const transitionKey = `${oldStatus}->${newStatus}`;

    switch (transitionKey) {
        case "waiting_for_courier->pending_pickup":
            await notifySeller(orderId, sellerPayload);
            break;

        case "pending_pickup->waiting_for_courier":
            await notifySeller(orderId, sellerPayload);
            break;

        case "pending_pickup->picked_up":
            await Promise.all([
                notifySeller(orderId, sellerPayload),
                notifyBuyer(orderId, buyerPayload),
            ]);
            break;

        case "picked_up->in_transit":
            await notifyBuyer(orderId, buyerPayload);
            break;

        case "in_transit->delivered":
            await Promise.all([
                notifySeller(orderId, sellerPayload),
                notifyBuyer(orderId, buyerPayload),
            ]);
            break;
    }
}
