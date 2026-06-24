"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import L from "leaflet";
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

const ORIGIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4710fb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`;
const DEST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4710fb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;

function markerIcon(svg: string): L.DivIcon {
    return L.divIcon({
        className: "",
        html: `<div style="width:34px;height:34px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid #4710fb;">${svg}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
    });
}

export default function MapViewer({ shippingId, className }: MapViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const [route, setRoute] = useState<RouteData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const originIcon = useMemo(() => markerIcon(ORIGIN_SVG), []);
    const destIcon = useMemo(() => markerIcon(DEST_SVG), []);

    useEffect(() => {
        const controller = new AbortController();
        setRoute(null);
        setError(null);

        fetch(`/api/shipping/shipments/${shippingId}/route`, {
            signal: controller.signal,
            headers: {
                "x-api-key-hash": process.env.NEXT_PUBLIC_INTERNAL_API_KEY_HASH ?? "",
            },
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

    useEffect(() => {
        if (!route || !containerRef.current) return;

        const container = containerRef.current;

        if ("_leaflet_id" in container) {
            delete (container as Record<string, unknown>)._leaflet_id;
        }

        const positions: [number, number][] = route.geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
        );

        const map = L.map(container, {
            center: positions[0] ?? [-38.719, -62.272],
            zoom: 13,
            zoomControl: false,
        });

        mapRef.current = map;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        L.polyline(positions, {
            color: "#3e0ee0",
            weight: 7,
            opacity: 0.8,
        }).addTo(map);

        L.polyline(positions, {
            color: "#4710fb",
            weight: 4,
            opacity: 0.8,
        }).addTo(map);

        if (route.waypoints) {
            L.marker(
                [route.waypoints.origin.lat, route.waypoints.origin.lng],
                { icon: originIcon }
            ).addTo(map);
            L.marker(
                [
                    route.waypoints.destination.lat,
                    route.waypoints.destination.lng,
                ],
                { icon: destIcon }
            ).addTo(map);
        }

        if (positions.length > 0) {
            map.fitBounds(positions, { padding: [40, 40] });
        }

        return () => {
            if ("_leaflet_id" in container) {
                delete (container as Record<string, unknown>)._leaflet_id;
            }
            try {
                map.remove();
            } catch {
                // ignore
            }
            mapRef.current = null;
        };
    }, [route, originIcon, destIcon]);

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

    return <div ref={containerRef} className={className ?? "h-full w-full"} />;
}
