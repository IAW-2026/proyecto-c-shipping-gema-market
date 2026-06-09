import { ApiResult } from "../types";
import { BuyerStatusUpdate, BuyerNotificationResponse, BuyerDataResponse } from "./buyer-api.types";
import { hashApiKey } from "@/lib/auth/api-key";
import { logOutgoingRequest, logOutgoingResponse } from "@/lib/utils/api-logger";

const BUYER_API_URL = process.env.BUYER_API_URL;
const API_KEY_HASH = hashApiKey(process.env.INTERNAL_API_KEY ?? "");

export const buyerApiClient = {
    getBuyerData: async (buyerId: string): ApiResult<BuyerDataResponse> => {
        const url = `${BUYER_API_URL}/api/buyer/${buyerId}`;
        logOutgoingRequest("BUYER", "GET", url);

        try {
            const res = await fetch(url, {
                method: "GET",
                headers: { "x-api-key-hash": API_KEY_HASH },
            });
            if (!res.ok) {
                logOutgoingResponse("BUYER", res.status, { error: `Buyer API error: ${res.status}` });
                return { error: { message: `Buyer API error: ${res.status}` }, status: res.status };
            }
            const data = await res.json();
            logOutgoingResponse("BUYER", res.status, data);
            return { data, status: res.status };
        } catch (error) {
            console.error("[BUYER CLIENT] getBuyerData error:", error);
            logOutgoingResponse("BUYER", 503, { error: "Error contacting Buyer API" });
            return { error: { message: "Error contacting Buyer API" }, status: 503 };
        }
    },

    notifyStatusChange: async (orderId: string, payload: BuyerStatusUpdate): ApiResult<BuyerNotificationResponse> => {
        const url = `${BUYER_API_URL}/api/buyer/ordenes/${orderId}/estado-envio`;
        logOutgoingRequest("BUYER", "GET", url);

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key-hash": API_KEY_HASH },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                logOutgoingResponse("BUYER", res.status, { error: `Buyer API error: ${res.status}` });
                return { error: { message: `Buyer API error: ${res.status}` }, status: res.status };
            }
            const data = await res.json();
            logOutgoingResponse("BUYER", res.status, data);
            return { data, status: res.status };
        } catch (error) {
            console.error("[BUYER CLIENT] notifyStatusChange error:", error);
            logOutgoingResponse("BUYER", 503, { error: "Error contacting Buyer API" });
            return { error: { message: "Error contacting Buyer API" }, status: 503 };
        }
    }
};
