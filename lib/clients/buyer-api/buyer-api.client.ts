import { ApiResult } from "../types";
import { BuyerStatusUpdate, BuyerNotificationResponse, BuyerDataResponse } from "./buyer-api.types";

/**
 * Cliente para la comunicación con el microservicio de Buyer.
 * 
 * NOTA: Los endpoints externos (Buyer App) aún no están disponibles.
 * Todos los métodos retornan datos simulados directamente.
 * TODO: Integrar con Buyer App cuando esté disponible.
 */
export const buyerApiClient = {
    /**
     * Obtiene los datos de un comprador por su ID.
     * POST /api/buyer/:buyer_id
     * TODO: Reemplazar mock con fetch real a Buyer App.
     */
    getBuyerData: async (buyerId: string, req?: Request): ApiResult<BuyerDataResponse> => {
        console.log(`[M2M] Buyer → POST /api/buyer/${buyerId}`);
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
            data: {
                id: buyerId,
                email: "",
                full_name: req?.headers.get("X-Mock-Buyer-Name") ?? "Carlos Pérez",
                phone_number: req?.headers.get("X-Mock-Buyer-Phone") ?? "2915550101",
                address: { zip: "", number: "", street: "" },
                created_at: new Date().toISOString()
            },
            status: 200
        };
    },

    /**
     * Notifica al Buyer sobre un cambio en el estado del envío de una orden.
     * TODO: Reemplazar mock con fetch real a Buyer App.
     */
    notifyStatusChange: async (orderId: string, payload: BuyerStatusUpdate): ApiResult<BuyerNotificationResponse> => {
        console.log(`[M2M] Buyer → POST /api/buyer/ordenes/${orderId}/estado-envio → ${payload.status}`);

        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            data: { received: true, order_id: orderId },
            status: 200
        };
    }
};
