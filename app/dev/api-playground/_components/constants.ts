import type { PlaygroundConfig, EndpointDef, InternalCallDef } from "./types";

export const DEFAULT_CONFIG: PlaygroundConfig = {
    origin_street: "San Martin",
    origin_number: "123",
    origin_zip: "8000",
    dest_street: "Av. San Martin",
    dest_number: "456",
    dest_zip: "8000",
    buyer_name: "Carlos Perez",
    buyer_phone: "2915550101",
    weight_kg: 15,
    height_cm: 80,
    width_cm: 100,
    depth_cm: 50,
};

export const ENDPOINTS: EndpointDef[] = [
    {
        id: "cotizar",
        app: "buyer",
        step: 1,
        label: "Cotizar envio",
        method: "POST",
        url: "/api/shipping/cotizaciones",
    },
    {
        id: "reservar",
        app: "payments",
        step: 2,
        label: "Reservar cotizacion",
        method: "POST",
        url: "/api/shipping/cotizaciones/reservar",
    },
    {
        id: "liberar",
        app: "payments",
        step: 2,
        label: "Liberar reserva",
        method: "POST",
        url: "/api/shipping/cotizaciones/liberar-reserva",
    },
    {
        id: "crear-envio",
        app: "seller",
        step: 3,
        label: "Crear envio",
        method: "POST",
        url: "/api/shipping/envios",
    },
];

export const INTERNAL_CALLS: Record<string, InternalCallDef[]> = {
    cotizar: [
        { target: "Seller", method: "GET", url: "/productos/{product_id}/direccion-origen" },
    ],
    "crear-envio": [
        { target: "Buyer", method: "POST", url: "/buyer/{buyer_id}" },
    ],
};

export const APP_META: Record<string, { label: string; color: string }> = {
    buyer: { label: "Buyer App", color: "border-sand" },
    payments: { label: "Payments App", color: "border-stone" },
    seller: { label: "Seller App", color: "border-mist" },
};

export const TARGET_COLORS: Record<string, string> = {
    Seller: "border-l-sand text-sand",
    Buyer: "border-l-mist text-mist",
    Payments: "border-l-stone text-stone",
};
