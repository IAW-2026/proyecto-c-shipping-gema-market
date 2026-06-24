import { ApiResult } from "../types";
import { OriginAddressResponse, SellerNotificationResponse, SellerStatusUpdate } from "./seller-api.types";
import { hashApiKey } from "@/lib/auth/api-key";
import { logOutgoingRequest, logOutgoingResponse } from "@/lib/utils/api-logger";

const SELLER_API_URL = process.env.SELLER_API_URL;
const API_KEY_HASH = hashApiKey(process.env.INTERNAL_API_KEY ?? "");

export const sellerApiClient = {
    getOriginAddress: async (productId: string): ApiResult<OriginAddressResponse> => {
        const url = `${SELLER_API_URL}/api/seller/productos/${productId}/direccion-origen`;
        logOutgoingRequest("SELLER", "GET", url);

        try {
            const res = await fetch(url, {
                headers: { "x-api-key-hash": API_KEY_HASH },
            });
            if (!res.ok) {
                logOutgoingResponse("SELLER", res.status, { error: `Seller API error: ${res.status}` });
                return { error: { message: `Seller API error: ${res.status}` }, status: res.status };
            }
            const data = await res.json();
            logOutgoingResponse("SELLER", res.status, data);
            return { data, status: res.status };
        } catch (error) {
            console.error("[SELLER CLIENT] getOriginAddress error:", error);
            logOutgoingResponse("SELLER", 503, { error: "Error contacting Seller API" });
            return { error: { message: "Error contacting Seller API" }, status: 503 };
        }
    },

    notifyStatusChange: async (orderId: string, payload: SellerStatusUpdate): ApiResult<SellerNotificationResponse> => {
        const url = `${SELLER_API_URL}/api/seller/ventas/${orderId}/estado-envio`;
        logOutgoingRequest("SELLER", "POST", url);

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key-hash": API_KEY_HASH },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                logOutgoingResponse("SELLER", res.status, { error: `Seller API error: ${res.status}` });
                return { error: { message: `Seller API error: ${res.status}` }, status: res.status };
            }
            const data = await res.json();
            logOutgoingResponse("SELLER", res.status, data);
            return { data, status: res.status };
        } catch (error) {
            console.error("[SELLER CLIENT] notifyStatusChange error:", error);
            logOutgoingResponse("SELLER", 503, { error: "Error contacting Seller API" });
            return { error: { message: "Error contacting Seller API" }, status: 503 };
        }
    }
};
