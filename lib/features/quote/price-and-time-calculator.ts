/** Funciones puras para el cálculo de volumen, precio y tiempo estimado de envío. */
const DEFAULT_DISTANCE_KM = 10;
export { DEFAULT_DISTANCE_KM };

const DEFAULT_PRICE_PER_KM = 200;
export const CURRENCY = "ARS";

import { ADMIN_DAYS, SECONDS_PER_TRANSIT_DAY, MAX_TRANSIT_DAYS } from "@/lib/constants/shipment";

export function calculateVolume(height_cm: number, width_cm: number, depth_cm: number): number {
    return height_cm * width_cm * depth_cm / 1_000_000;
}

export function calculateVolumetricWeight(volumeM3: number): number {
    return volumeM3 * 250;
}

export function calculateBillableWeight(realKg: number, volumetricKg: number): number {
    return Math.max(realKg, volumetricKg);
}

export function calculatePrice(pricePerKm: number, distanceKm: number): number {
    return pricePerKm * distanceKm;
}

export function calculateEstimatedDays(durationSeconds?: number): number {
    if (!durationSeconds) return 2;
    const transitDays = Math.ceil(durationSeconds / SECONDS_PER_TRANSIT_DAY);
    return ADMIN_DAYS + Math.min(transitDays, MAX_TRANSIT_DAYS);
}

export function getDefaultPricePerKm(): number {
    return DEFAULT_PRICE_PER_KM;
}
