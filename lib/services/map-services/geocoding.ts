import type { ORSCoordinate } from "./config";

export interface GeocodeResult {
    coordinates: ORSCoordinate;
    displayName: string;
}

export async function getCoordinatesFromAddress(
  address: { street: string; number: string; city?: string | null; zip?: string | null }
): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    street: `${address.street} ${address.number}`,
    city: "Bahía Blanca",
    country: "Argentina",
    format: "json",
    limit: "1",
  });

  if (address.zip) {
    params.set("postalcode", address.zip);
  }

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const res = await fetch(url, { headers: { "User-Agent": "ShippingApp/1.0" } });

  if (!res.ok) {
    console.error("[Nominatim] Geocode error:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  if (!data?.length) return null;

  return {
    coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
    displayName: data[0].display_name ?? "",
  };
}
