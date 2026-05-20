import { ApiResult } from "../types";
import { OriginAddressResponse, SellerNotificationResponse, SellerStatusUpdate } from "./seller-api.types";
import type { ApiTrace } from "@/lib/shared/api-trace";

export const sellerApiClient = {
    getOriginAddress: async (productId: string, _trace?: ApiTrace, req?: Request): ApiResult<OriginAddressResponse> => {
        console.log(`[M2M] Seller → GET /api/seller/productos/${productId}/direccion-origen`);
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

    notifyStatusChange: async (orderId: string, payload: SellerStatusUpdate): ApiResult<SellerNotificationResponse> => {
        console.log(`[M2M] Seller → POST /api/seller/ventas/${orderId}/estado-envio → ${payload.status}`);
        await new Promise(resolve => setTimeout(resolve, 300));
        return { data: { success: true }, status: 200 };
    }
};
