"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface RouteData {
    geometry: {
        type: "LineString";
        coordinates: [number, number][];
    };
    waypoints: {
        origin: { lat: number; lng: number };
        destination: { lat: number; lng: number };
    };
}

interface MapViewerProps {
    shippingId: string;
    className?: string;
}

function FitBounds({ coords }: { coords: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (coords.length > 0) {
            map.fitBounds(coords, { padding: [40, 40] });
        }
    }, [map, coords]);
    return null;
}

export default function MapViewer({ shippingId, className }: MapViewerProps) {
    const [route, setRoute] = useState<RouteData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setError(null);

        fetch(`/api/shipping/envios/${shippingId}/route`, {
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error ?? "Error al obtener la ruta");
                }
                return res.json();
            })
            .then(setRoute)
            .catch((err) => {
                if (err.name !== "AbortError") setError(err.message);
            });

        return () => controller.abort();
    }, [shippingId]);

    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-slate-200 to-slate-100">
                <p className="text-sm text-red-600">{error}</p>
            </div>
        );
    }

    if (!route) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-slate-200 to-slate-100">
                <p className="text-sm text-slate-500">Cargando mapa...</p>
            </div>
        );
    }

    const positions: [number, number][] = route.geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
    );

    return (
        <MapContainer
            center={positions[0] ?? [-38.719, -62.272]}
            zoom={13}
            className={className ?? "h-full w-full"}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline
                positions={positions}
                pathOptions={{
                    color: "#936639",
                    weight: 4,
                    opacity: 0.8,
                }}
            />
            <FitBounds coords={positions} />
        </MapContainer>
    );
}
