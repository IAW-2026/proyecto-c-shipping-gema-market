export type ORSCoordinate = [lng: number, lat: number];

const ORS_BASE = "https://api.openrouteservice.org";

export function getApiKey(): string {
  const key = process.env.ORS_API_KEY;
  if (!key) {
    throw Object.assign(new Error("ORS_API_KEY no configurada"), { statusCode: 500, code: "MISSING_API_KEY" });
  }
  return key;
}

export function getOrsBaseUrl(): string {
  return ORS_BASE;
}
