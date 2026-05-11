import { ApiResult } from "../types";
import { BuyerStatusUpdate, BuyerNotificationResponse } from "./buyer-api.types";

/**
 * Cliente para la comunicación con el microservicio de Buyer.
 * Implementa el patrón Adapter para aislar a la aplicación de cambios en la API externa.
 */
export const buyerApiClient = {
    /**
     * Notifica al Buyer sobre un cambio en el estado del envío de una orden.
     */
    notifyStatusChange: async (orderId: string, payload: BuyerStatusUpdate): ApiResult<BuyerNotificationResponse> => {
        // TODO: Implementar fetch real usando variables de entorno para la URL
        console.log(`[M2M] Notificando a Buyer API para orden ${orderId}`, payload);

        // Simulamos latencia de red
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock de respuesta exitosa
        return {
            data: {
                received: true,
                order_id: orderId
            },
            status: 200
        };
    }
};
