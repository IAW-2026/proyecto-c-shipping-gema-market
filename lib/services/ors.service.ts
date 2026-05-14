export type ORSCoordinate = [lng: number, lat: number];

export interface ORSGeocodeFeature {
    geometry: {
        coordinates: ORSCoordinate;
        type: string;
    };
    properties: {
        label: string;
        confidence: number;
        [key: string]: unknown;
    };
}

export interface ORSGeocodeResponse {
    features: ORSGeocodeFeature[];
}

export interface ORSFeatureCollection {
    features: Array<{
        geometry: {
            type: "LineString";
            coordinates: ORSCoordinate[];
        };
        properties: {
            summary: {
                distance: number;
                duration: number;
            };
        };
    }>;
}

export interface ORSRouteResult {
    geometry: {
        type: "LineString";
        coordinates: ORSCoordinate[];
    };
    summary: {
        distance: number;
        duration: number;
    };
}

const ORS_BASE = "https://api.openrouteservice.org";

function getApiKey(): string {
    const key = process.env.ORS_API_KEY;
    if (!key) {
        throw Object.assign(new Error("ORS_API_KEY no configurada"), { statusCode: 500, code: "MISSING_API_KEY" });
    }
    return key;
}

export async function getCoordinatesFromAddress(
    address: { street: string; number: string }
): Promise<ORSCoordinate | null> {
    const apiKey = getApiKey();
    const addr = `${address.street} ${address.number}`;

    const params = new URLSearchParams({
        api_key: apiKey,
        address: addr,
        county: "Bahía Blanca",
        region: "Buenos Aires",
        country: "Argentina",
        size: "1",
    });

    const url = `${ORS_BASE}/geocode/search/structured?${params.toString()}`;
    const res = await fetch(url, {
        headers: { Accept: "application/json" },
    });

    if (!res.ok) {
        console.error("[ORS] Geocode error:", res.status, await res.text());
        return null;
    }

    const data: ORSGeocodeResponse = await res.json();
    if (!data.features?.length) return null;

    const coords = data.features[0].geometry.coordinates;
    return coords;
}

export async function getRoute(
    origin: ORSCoordinate,
    destination: ORSCoordinate
): Promise<ORSRouteResult> {
    const apiKey = getApiKey();

    const url = `${ORS_BASE}/v2/directions/driving-car/geojson?api_key=${apiKey}`;
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            coordinates: [origin, destination],
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("[ORS] Directions error:", res.status, text);
        throw Object.assign(
            new Error(`Error al obtener la ruta: ${res.status}`),
            { statusCode: 502, code: "ORS_ERROR" }
        );
    }

    const data: ORSFeatureCollection = await res.json();
    const feature = data.features?.[0];

    if (!feature) {
        throw Object.assign(
            new Error("No se encontró una ruta entre las direcciones"),
            { statusCode: 422, code: "NO_ROUTE" }
        );
    }

    return {
        geometry: feature.geometry,
        summary: feature.properties.summary,
    };
}
