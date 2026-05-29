let cachedRate: { value: number; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getUsdToArsRate(): Promise<number> {
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_TTL_MS) {
    return cachedRate.value;
  }

  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/oficial");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { compra: number; venta: number };
    const rate = data.venta;
    cachedRate = { value: rate, timestamp: Date.now() };
    return rate;
  } catch {
    const fallback = process.env.DEFAULT_USD_RATE
      ? Number.parseFloat(process.env.DEFAULT_USD_RATE)
      : 1200;
    cachedRate = { value: fallback, timestamp: Date.now() };
    return fallback;
  }
}
