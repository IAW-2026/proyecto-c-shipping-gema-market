import { getApiKey, getOrsBaseUrl, type ORSCoordinate } from "./config";

interface ORSMatrixResponse {
  distances?: number[][];
  durations?: number[][];
  sources: Array<{ location: ORSCoordinate }>;
  destinations: Array<{ location: ORSCoordinate }>;
}

export async function getMatrixDistance(
  origin: ORSCoordinate,
  destination: ORSCoordinate
): Promise<{ distance_km: number; duration_seconds: number | null }> {
  const apiKey = getApiKey();
  const url = `${getOrsBaseUrl()}/v2/matrix/driving-car?api_key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      locations: [origin, destination],
      metrics: ["distance", "duration"],
      sources: [0],
      destinations: [1],
      units: "km",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[ORS] Matrix error:", res.status, text);
    throw Object.assign(new Error(`Error al calcular distancia: ${res.status}`), { statusCode: 502, code: "ORS_ERROR" });
  }

  const data: ORSMatrixResponse = await res.json();

  return {
    distance_km: data.distances?.[0]?.[0] ?? 0,
    duration_seconds: data.durations?.[0]?.[0] ?? null,
  };
}
