import { getApiKey, getOrsBaseUrl, type ORSCoordinate } from "./config";

interface ORSFeatureCollection {
  features: Array<{
    geometry: { type: "LineString"; coordinates: ORSCoordinate[] };
    properties: { summary: { distance: number; duration: number } };
  }>;
}

export interface ORSRouteResult {
  geometry: { type: "LineString"; coordinates: ORSCoordinate[] };
  summary: { distance: number; duration: number };
}

export async function getRoute(origin: ORSCoordinate, destination: ORSCoordinate): Promise<ORSRouteResult> {
  const apiKey = getApiKey();
  const url = `${getOrsBaseUrl()}/v2/directions/driving-car/geojson?api_key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coordinates: [origin, destination] }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[ORS] Directions error:", res.status, text);
    throw Object.assign(new Error(`Error al obtener la ruta: ${res.status}`), { statusCode: 502, code: "ORS_ERROR" });
  }

  const data: ORSFeatureCollection = await res.json();
  const feature = data.features?.[0];

  if (!feature) {
    throw Object.assign(new Error("No se encontró una ruta entre las direcciones"), { statusCode: 422, code: "NO_ROUTE" });
  }

  return {
    geometry: feature.geometry,
    summary: feature.properties.summary,
  };
}
