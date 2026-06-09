import { EXCHANGE_RATE_FALLBACK } from "@/lib/config/exchange-rate";
import { logOutgoingRequest, logOutgoingResponse } from "@/lib/utils/api-logger";

let cachedRate: { value: number; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getUsdToArsRate(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_TTL_MS) {
    return cachedRate.value;
  }

  const url = "https://dolarapi.com/v1/dolares/oficial";
  logOutgoingRequest("DOLARAPI", "GET", url);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { compra: number; venta: number };
    const rate = data.venta;
    cachedRate = { value: rate, timestamp: Date.now() };
    logOutgoingResponse("DOLARAPI", 200, { rate });
    return rate;
  } catch {
    console.warn(`[Exchange Rate] API falló, usando fallback: ${EXCHANGE_RATE_FALLBACK}`);
    logOutgoingResponse("DOLARAPI", 0, { error: "fallback", rate: EXCHANGE_RATE_FALLBACK });
    cachedRate = { value: EXCHANGE_RATE_FALLBACK, timestamp: Date.now() };
    return EXCHANGE_RATE_FALLBACK;
  }
}
