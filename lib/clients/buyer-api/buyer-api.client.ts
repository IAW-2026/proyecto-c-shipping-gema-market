import { ApiResult } from "../types";
import { BuyerStatusUpdate, BuyerNotificationResponse, BuyerDataResponse } from "./buyer-api.types";
import { hashApiKey } from "@/lib/auth/api-key";

const BUYER_API_URL = process.env.BUYER_API_URL;
const API_KEY_HASH = hashApiKey(process.env.INTERNAL_API_KEY ?? "");

export const buyerApiClient = {
    getBuyerData: async (buyerId: string, _req?: Request): ApiResult<BuyerDataResponse> => {
        const mockName = _req?.headers.get("X-Mock-Buyer-Name");
        const mockPhone = _req?.headers.get("X-Mock-Buyer-Phone");

        if (mockName && mockPhone) {
            return {
                data: {
                    id: buyerId,
                    full_name: mockName,
                    phone_number: mockPhone,
                    email: `${mockName.toLowerCase().replace(/\s+/g, ".")}@email.com`,
                    address: { street: "", number: "", zip: "" },
                    created_at: new Date().toISOString(),
                },
                status: 200,
            };
        }

        try {
            const res = await fetch(`${BUYER_API_URL}/api/buyer/${buyerId}`, {
                method: "POST",
                headers: { "x-api-key-hash": API_KEY_HASH },
            });
            if (!res.ok) {
                return { error: { message: `Buyer API error: ${res.status}` }, status: res.status };
            }
            const data = await res.json();
            return { data, status: res.status };
        } catch (error) {
            console.error("[BUYER CLIENT] getBuyerData error:", error);
            return { error: { message: "Error contacting Buyer API" }, status: 503 };
        }
    },

    notifyStatusChange: async (orderId: string, payload: BuyerStatusUpdate): ApiResult<BuyerNotificationResponse> => {
        try {
            const res = await fetch(`${BUYER_API_URL}/api/buyer/ordenes/${orderId}/estado-envio`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key-hash": API_KEY_HASH },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                return { error: { message: `Buyer API error: ${res.status}` }, status: res.status };
            }
            const data = await res.json();
            return { data, status: res.status };
        } catch (error) {
            console.error("[BUYER CLIENT] notifyStatusChange error:", error);
            return { error: { message: "Error contacting Buyer API" }, status: 503 };
        }
    }
};
