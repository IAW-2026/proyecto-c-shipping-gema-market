import { ApiResult } from "../types";
import { SellerOrderDetails, SellerNotificationResponse, OriginAddressResponse } from "./seller-api.types";
import type { ApiTrace } from "@/lib/shared/api-trace";

const SELLER_API_URL = process.env.SELLER_API_URL || "http://localhost:3001";

/**
 * Cliente para la comunicación con el microservicio de Seller.
 */
export const sellerApiClient = {
    /**
     * Obtiene la dirección de origen del vendedor para un producto.
     * GET /api/seller/productos/:product_id/direccion-origen
     */
    getOriginAddress: async (productId: string, trace?: ApiTrace): ApiResult<OriginAddressResponse> => {
        console.log(`[M2M] Consultando dirección de origen para producto ${productId}`);

        const traceEntry = {
            target: "Seller App",
            method: "GET" as const,
            url: `/api/seller/productos/${productId}/direccion-origen`,
        };

        try {
            const res = await fetch(
                `${SELLER_API_URL}/api/seller/productos/${productId}/direccion-origen`,
                { method: "GET", headers: { "Content-Type": "application/json" } }
            );

            if (!res.ok) {
                console.warn(`[M2M] Seller API respondió con ${res.status}, usando fallback`);
                throw new Error(`HTTP ${res.status}`);
            }

            const data: OriginAddressResponse = await res.json();
            trace?.add({ ...traceEntry, response_status: res.status, response_body: data });
            return { data, status: res.status };
        } catch {
            const fallback = { origin_address: { street: "San Martín", number: "123", zip: "8000" } };
            console.log("[M2M] Usando dirección de origen mock");
            await new Promise(resolve => setTimeout(resolve, 200));
            trace?.add({ ...traceEntry, response_status: 200, response_body: fallback });
            return { data: fallback, status: 200 };
        }
    },

    /**
     * Obtiene detalles adicionales de una orden desde el vendedor para logística.
     */
    getOrderDetails: async (orderId: string, trace?: ApiTrace): ApiResult<SellerOrderDetails> => {
        console.log(`[M2M] Consultando Seller API para orden ${orderId}`);

        const traceEntry = {
            target: "Seller App",
            method: "GET" as const,
            url: `/api/seller/ordenes/${orderId}`,
        };

        try {
            const res = await fetch(
                `${SELLER_API_URL}/api/seller/ordenes/${orderId}`,
                { method: "GET", headers: { "Content-Type": "application/json" } }
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: SellerOrderDetails = await res.json();
            trace?.add({ ...traceEntry, response_status: res.status, response_body: data });
            return { data, status: res.status };
        } catch {
            const fallback = { order_id: orderId, product_name: "Producto Mock", quantity: 1, pickup_address: "Calle Falsa 123" };
            console.log("[M2M] Usando mock para detalles de orden");
            await new Promise(resolve => setTimeout(resolve, 400));
            trace?.add({ ...traceEntry, response_status: 200, response_body: fallback });
            return { data: fallback, status: 200 };
        }
    },

    /**
     * Notifica al Seller que un envío ha sido tomado por un repartidor.
     */
    notifyShipmentTaken: async (orderId: string, trace?: ApiTrace): ApiResult<SellerNotificationResponse> => {
        console.log(`[M2M] Notificando toma de envío a Seller API: ${orderId}`);

        const traceEntry = {
            target: "Seller App",
            method: "POST" as const,
            url: `/api/seller/envios/${orderId}/tomado`,
            request_body: { order_id: orderId },
        };

        try {
            const res = await fetch(
                `${SELLER_API_URL}/api/seller/envios/${orderId}/tomado`,
                { method: "POST", headers: { "Content-Type": "application/json" } }
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: SellerNotificationResponse = await res.json();
            trace?.add({ ...traceEntry, response_status: res.status, response_body: data });
            return { data, status: res.status };
        } catch {
            const fallback = { success: true };
            trace?.add({ ...traceEntry, response_status: 200, response_body: fallback });
            return { data: fallback, status: 200 };
        }
    }
};
