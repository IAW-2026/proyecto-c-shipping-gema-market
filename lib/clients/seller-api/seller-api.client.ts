import { ApiResult } from "../types";
import { SellerOrderDetails, SellerNotificationResponse, OriginAddressResponse, SellerStatusUpdate } from "./seller-api.types";
import type { ApiTrace } from "@/lib/shared/api-trace";

/**
 * Cliente para la comunicación con el microservicio de Seller.
 * 
 * NOTA: Los endpoints externos (Seller App) aún no están disponibles.
 * Todos los métodos retornan datos simulados directamente.
 * TODO: Integrar con Seller App cuando esté disponible.
 */
export const sellerApiClient = {
    /**
     * Obtiene la dirección de origen del vendedor para un producto.
     * GET /api/seller/productos/:product_id/direccion-origen
     * TODO: Reemplazar mock con fetch real a Seller App.
     */
    getOriginAddress: async (_productId: string, _trace?: ApiTrace, req?: Request): ApiResult<OriginAddressResponse> => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
            data: {
                origin_address: {
                    street: req?.headers.get("X-Mock-Origin-Street") ?? "San Martín",
                    number: req?.headers.get("X-Mock-Origin-Number") ?? "123",
                    zip: req?.headers.get("X-Mock-Origin-Zip") ?? "8000",
                }
            },
            status: 200
        };
    },

    /**
     * Obtiene detalles adicionales de una orden desde el vendedor para logística.
     * GET /api/seller/ordenes/:order_id
     * TODO: Reemplazar mock con fetch real a Seller App.
     */
    getOrderDetails: async (orderId: string, _trace?: ApiTrace): ApiResult<SellerOrderDetails> => {
        const fallback = { order_id: orderId, product_name: "Producto Mock", quantity: 1, pickup_address: "Calle Falsa 123" };

        await new Promise(resolve => setTimeout(resolve, 400));
        return { data: fallback, status: 200 };
    },

    /**
     * Notifica al Seller que un envío ha sido tomado por un repartidor.
     * POST /api/seller/envios/:order_id/tomado
     * TODO: Reemplazar mock con fetch real a Seller App.
     */
    notifyShipmentTaken: async (_orderId: string, _trace?: ApiTrace): ApiResult<SellerNotificationResponse> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { data: { success: true }, status: 200 };
    },

    /**
     * Notifica al Seller sobre un cambio de estado general del envío.
     * POST /api/seller/envios/:order_id/status
     * TODO: Reemplazar mock con fetch real a Seller App.
     */
    notifyStatusChange: async (_orderId: string, _payload: SellerStatusUpdate): ApiResult<SellerNotificationResponse> => {
        console.log(`[M2M] Notificación a Seller API simulada: ${_payload.status}`);
        await new Promise(resolve => setTimeout(resolve, 300));
        return { data: { success: true }, status: 200 };
    }
};
