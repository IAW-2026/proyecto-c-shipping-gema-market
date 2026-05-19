import { ApiResult } from "../types";
import { PaymentReleaseRequest, PaymentReleaseResponse } from "./payments-api.types";

/**
 * Cliente para la comunicación con el microservicio de Payments.
 */
export const paymentsApiClient = {
    /**
     * Solicita la liberación del pago al repartidor tras una entrega exitosa.
     */
    releaseLogisticsPayment: async (request: PaymentReleaseRequest): ApiResult<PaymentReleaseResponse> => {
        console.log(`[M2M] Solicitando liberación de pago a Payments API para shipping ${request.shipping_id}`);
        
        await new Promise(resolve => setTimeout(resolve, 600));

        return {
            data: {
                transaction_id: `tx_${Math.random().toString(36).substr(2, 9)}`,
                status: "released"
            },
            status: 200
        };
    }
};
