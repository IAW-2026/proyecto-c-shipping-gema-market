import type { ORSCoordinate } from "./config";

export async function getCoordinatesFromAddress(
  address: { street: string; number: string; city?: string | null; zip?: string | null }
): Promise<ORSCoordinate | null> {
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

  return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
}
