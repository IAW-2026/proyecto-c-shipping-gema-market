import { ApiResult } from "../types";
import { OriginAddressResponse, SellerNotificationResponse, SellerStatusUpdate } from "./seller-api.types";
import type { ApiTrace } from "@/lib/shared/api-trace";
import { hashApiKey } from "@/lib/auth/api-key";

const SELLER_API_URL = process.env.SELLER_API_URL;
const API_KEY_HASH = hashApiKey(process.env.INTERNAL_API_KEY ?? "");

export const sellerApiClient = {
    getOriginAddress: async (productId: string, _trace?: ApiTrace, _req?: Request): ApiResult<OriginAddressResponse> => {
        const mockStreet = _req?.headers.get("X-Mock-Origin-Street");
        const mockNumber = _req?.headers.get("X-Mock-Origin-Number");
        const mockZip = _req?.headers.get("X-Mock-Origin-Zip");

        if (mockStreet && mockNumber && mockZip) {
            return {
                data: {
                    origin_address: {
                        street: mockStreet,
                        number: mockNumber,
                        zip: mockZip,
                    },
                },
                status: 200,
            };
        }

        try {
            const res = await fetch(`${SELLER_API_URL}/api/seller/productos/${productId}/direccion-origen`, {
                headers: { "x-api-key-hash": API_KEY_HASH },
            });
            if (!res.ok) {
                return { error: { message: `Seller API error: ${res.status}` }, status: res.status };
            }
            const data = await res.json();
            return { data, status: res.status };
        } catch (error) {
            console.error("[SELLER CLIENT] getOriginAddress error:", error);
            return { error: { message: "Error contacting Seller API" }, status: 503 };
        }
    },

    notifyStatusChange: async (orderId: string, payload: SellerStatusUpdate): ApiResult<SellerNotificationResponse> => {
        try {
            const res = await fetch(`${SELLER_API_URL}/api/seller/ventas/${orderId}/estado-envio`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key-hash": API_KEY_HASH },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                return { error: { message: `Seller API error: ${res.status}` }, status: res.status };
            }
            const data = await res.json();
            return { data, status: res.status };
        } catch (error) {
            console.error("[SELLER CLIENT] notifyStatusChange error:", error);
            return { error: { message: "Error contacting Seller API" }, status: 503 };
        }
    }
};
