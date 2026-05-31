import type { ShipmentStatus } from "@/lib/constants/shipment";
import { sellerApiClient } from "@/lib/clients/seller-api/seller-api.client";
import { buyerApiClient } from "@/lib/clients/buyer-api/buyer-api.client";
import type { SellerStatusUpdate } from "@/lib/clients/seller-api/seller-api.types";
import type { BuyerStatusUpdate } from "@/lib/clients/buyer-api/buyer-api.types";
import { notificationRegistry } from "@/lib/utils/notification-registry";

interface NotificationPayload {
    orderId: string;
    shippingId: string;
    trackingCode: string;
    oldStatus: ShipmentStatus;
    newStatus: ShipmentStatus;
}

async function notifySeller(orderId: string, payload: SellerStatusUpdate, transition?: string) {
    const url = `/api/seller/ventas/${orderId}/estado-envio`;
    try {
        const result = await sellerApiClient.notifyStatusChange(orderId, payload);
        notificationRegistry.add({
            target: "SELLER",
            method: "POST",
            url,
            body: payload as unknown as Record<string, unknown>,
            status: result.status,
            response: result.data ? { success: true } : undefined,
            transition,
        });
    } catch (error) {
        console.error("[NOTIFICATION] Error notificando a Seller:", error);
        notificationRegistry.add({
            target: "SELLER",
            method: "POST",
            url,
            body: payload as unknown as Record<string, unknown>,
            status: 500,
            response: { error: String(error) },
            transition,
        });
    }
}

async function notifyBuyer(orderId: string, payload: BuyerStatusUpdate, transition?: string) {
    const url = `/api/buyer/ordenes/${orderId}/estado-envio`;
    try {
        const result = await buyerApiClient.notifyStatusChange(orderId, payload);
        notificationRegistry.add({
            target: "BUYER",
            method: "POST",
            url,
            body: payload as unknown as Record<string, unknown>,
            status: result.status,
            response: result.data ? { received: true, order_id: orderId } : undefined,
            transition,
        });
    } catch (error) {
        console.error("[NOTIFICATION] Error notificando a Buyer:", error);
        notificationRegistry.add({
            target: "BUYER",
            method: "POST",
            url,
            body: payload as unknown as Record<string, unknown>,
            status: 500,
            response: { error: String(error) },
            transition,
        });
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
    const transition = `${oldStatus} -> ${newStatus}`;

    switch (transitionKey) {
        case "waiting_for_courier->pending_pickup":
            await notifySeller(orderId, sellerPayload, transition);
            break;

        case "pending_pickup->waiting_for_courier":
            await notifySeller(orderId, sellerPayload, transition);
            break;

        case "pending_pickup->picked_up":
            await Promise.all([
                notifySeller(orderId, sellerPayload, transition),
                notifyBuyer(orderId, buyerPayload, transition),
            ]);
            break;

        case "picked_up->in_transit":
            await notifyBuyer(orderId, buyerPayload, transition);
            break;

        case "in_transit->delivered":
            await Promise.all([
                notifySeller(orderId, sellerPayload, transition),
                notifyBuyer(orderId, buyerPayload, transition),
            ]);
            break;
    }
}
