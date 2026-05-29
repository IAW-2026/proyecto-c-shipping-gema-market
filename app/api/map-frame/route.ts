import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const shippingId = searchParams.get("shippingId");

    if (!shippingId) {
        return new NextResponse("Missing shippingId", { status: 400 });
    }

    const apiKeyHash = process.env.NEXT_PUBLIC_INTERNAL_API_KEY_HASH ?? "";

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
    <style>
        html, body, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
        body { font-family: system-ui, -apple-system, sans-serif; }
        .overlay {
            height: 100%; width: 100%; display: flex; align-items: center; justify-content: center;
        }
        .loading { background: linear-gradient(to bottom, #e2e8f0, #f1f5f9); color: #64748b; font-size: 14px; }
        .error { background: linear-gradient(to bottom, #e2e8f0, #f1f5f9); color: #dc2626; font-size: 14px; }
    </style>
</head>
<body>
    <div id="map">
        <div class="overlay loading">Cargando mapa...</div>
    </div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
    <script>
        (async function() {
            const shippingId = ${JSON.stringify(shippingId)};
            const apiKeyHash = ${JSON.stringify(apiKeyHash)};
            const container = document.getElementById('map');

            function markerIcon(svg) {
                return L.divIcon({
                    className: '',
                    html: '<div style="width:34px;height:34px;border-radius:50%;background:white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid #4710fb;">' + svg + '</div>',
                    iconSize: [34, 34],
                    iconAnchor: [17, 17],
                });
            }

            const ORIGIN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4710fb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>';
            const DEST_SVG   = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4710fb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>';

            try {
                const res = await fetch('/api/shipping/envios/' + shippingId + '/route', {
                    headers: { 'x-api-key-hash': apiKeyHash }
                });
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.error || 'Error al obtener la ruta');
                }
                const route = await res.json();
                const positions = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

                container.innerHTML = '';

                const map = L.map(container, {
                    center: positions[0] || [-38.719, -62.272],
                    zoom: 13,
                    zoomControl: false,
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);

                L.polyline(positions, { color: '#3e0ee0', weight: 7, opacity: 0.8 }).addTo(map);
                L.polyline(positions, { color: '#4710fb', weight: 4, opacity: 0.8 }).addTo(map);

                if (route.waypoints) {
                    L.marker([route.waypoints.origin.lat, route.waypoints.origin.lng], { icon: markerIcon(ORIGIN_SVG) }).addTo(map);
                    L.marker([route.waypoints.destination.lat, route.waypoints.destination.lng], { icon: markerIcon(DEST_SVG) }).addTo(map);
                }

                if (positions.length > 0) {
                    map.fitBounds(positions, { padding: [40, 40] });
                }
            } catch (err) {
                container.innerHTML = '<div class="overlay error">' + (err.message || 'Error al cargar el mapa') + '</div>';
            }
        })();
    </script>
</body>
</html>`;

    return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}
