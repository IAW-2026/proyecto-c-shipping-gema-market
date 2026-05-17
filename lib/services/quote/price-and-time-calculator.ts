/** Funciones puras para el cálculo de volumen, precio y tiempo estimado de envío. */
const DEFAULT_DISTANCE_KM = 10;
export { DEFAULT_DISTANCE_KM };

const DEFAULT_PRICE_PER_KM = 200;
export const CURRENCY = "ARS";

export function calculateVolume(height_cm: number, width_cm: number, depth_cm: number): number {
    return height_cm * width_cm * depth_cm / 1_000_000;
}

export function calculatePrice(pricePerKm: number, distanceKm: number): number {
    return pricePerKm * distanceKm;
}

export function calculateEstimatedDays(durationSeconds?: number): number {
    if (!durationSeconds) return 3;
    return Math.max(1, Math.min(7, Math.round(durationSeconds / 14400)));
}

export function getDefaultPricePerKm(): number {
    return DEFAULT_PRICE_PER_KM;
}
