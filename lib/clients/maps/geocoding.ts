import type { ORSCoordinate } from "./config";

export interface GeocodeResult {
    coordinates: ORSCoordinate;
    displayName: string;
}

let lastNominatimRequest = 0;

async function waitForNominatimSlot(): Promise<void> {
    const now = Date.now();
    const elapsed = now - lastNominatimRequest;
    if (elapsed < 1100) {
        await new Promise(r => setTimeout(r, 1100 - elapsed));
    }
    lastNominatimRequest = Date.now();
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
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await waitForNominatimSlot();

    const res = await fetch(url, { headers: { "User-Agent": "ShippingApp/1.0" } });

    if (res.ok) {
      const data = await res.json();
      if (!data?.length) return null;
      return {
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
        displayName: data[0].display_name ?? "",
      };
    }

    if (res.status === 429 && attempt < maxRetries) {
      const delay = 1000 * Math.pow(2, attempt);
      console.warn(`[Nominatim] 429, retrying in ${delay}ms (${attempt + 1}/${maxRetries})`);
      await new Promise(r => setTimeout(r, delay));
      continue;
    }

    console.error("[Nominatim] Geocode error:", res.status, await res.text());
    return null;
  }

  return null;
}
