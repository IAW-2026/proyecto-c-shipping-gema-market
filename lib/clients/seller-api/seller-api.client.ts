import { ApiResult } from "../types";
import { SellerOrderDetails, SellerNotificationResponse } from "./seller-api.types";

/**
 * Cliente para la comunicación con el microservicio de Seller.
 */
export const sellerApiClient = {
    /**
     * Obtiene detalles adicionales de una orden desde el vendedor para logística.
     */
    getOrderDetails: async (orderId: string): ApiResult<SellerOrderDetails> => {
        console.log(`[M2M] Consultando Seller API para orden ${orderId}`);
        
        await new Promise(resolve => setTimeout(resolve, 400));

        return {
            data: {
                order_id: orderId,
                product_name: "Producto Mock",
                quantity: 1,
                pickup_address: "Calle Falsa 123"
            },
            status: 200
        };
    },

    /**
     * Notifica al Seller que un envío ha sido tomado por un repartidor.
     */
    notifyShipmentTaken: async (orderId: string): ApiResult<SellerNotificationResponse> => {
        console.log(`[M2M] Notificando toma de envío a Seller API: ${orderId}`);
        return {
            data: { success: true },
            status: 200
        };
    }
};
