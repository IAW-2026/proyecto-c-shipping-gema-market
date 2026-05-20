"use client";

import { useState } from "react";
import { generatePrefixedId } from "@/lib/shared/utils";
import { TrafficLog, type LogEntry, type LogInternalCall } from "./_components/traffic-log";

type RequestState = "idle" | "loading" | "success" | "error";

type EndpointDef = {
    id: string;
    label: string;
    app: "buyer" | "payments" | "seller";
    step: number;
    method: string;
    url: string;
};

type PlaygroundConfig = {
    origin_street: string;
    origin_number: string;
    origin_zip: string;
    dest_street: string;
    dest_number: string;
    dest_zip: string;
    buyer_name: string;
    buyer_phone: string;
    weight_kg: number;
    height_cm: number;
    width_cm: number;
    depth_cm: number;
};

type FlowStatus = {
    quote_id: string | null;
    order_id: string | null;
    shipping_id: string | null;
    tracking_code: string | null;
    status: string | null;
};

type InternalCallDef = {
    target: string;
    method: string;
    url: string;
};

const DEFAULT_CONFIG: PlaygroundConfig = {
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

const ENDPOINTS: EndpointDef[] = [
    {
        id: "cotizar",
        app: "buyer",
        step: 1,
        label: "Cotizar envio",
        method: "POST",
        url: "/api/shipping/quotes",
    },
    {
        id: "reservar",
        app: "payments",
        step: 2,
        label: "Reservar cotizacion",
        method: "POST",
        url: "/api/shipping/quotes/reserve",
    },
    {
        id: "liberar",
        app: "payments",
        step: 2,
        label: "Liberar reserva",
        method: "POST",
        url: "/api/shipping/quotes/release",
    },
    {
        id: "crear-envio",
        app: "seller",
        step: 3,
        label: "Crear envio",
        method: "POST",
        url: "/api/shipping/shipments",
    },
];

const INTERNAL_CALLS: Record<string, InternalCallDef[]> = {
    cotizar: [
        { target: "Seller", method: "GET", url: "/productos/{product_id}/direccion-origen" },
    ],
    "crear-envio": [
        { target: "Buyer", method: "POST", url: "/buyer/{buyer_id}" },
    ],
};

const APP_META: Record<string, { label: string; color: string }> = {
    buyer: { label: "Buyer App", color: "border-sand" },
    payments: { label: "Payments App", color: "border-stone" },
    seller: { label: "Seller App", color: "border-mist" },
};

export default function ApiPlaygroundPage() {
    const [configOpen, setConfigOpen] = useState(true);
    const [config, setConfig] = useState<PlaygroundConfig>(DEFAULT_CONFIG);
    const [states, setStates] = useState<Record<string, RequestState>>({});
    const [flow, setFlow] = useState<FlowStatus>({
        quote_id: null,
        order_id: null,
        shipping_id: null,
        tracking_code: null,
        status: null,
    });
    const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

    const updateConfig = (patch: Partial<PlaygroundConfig>) => {
        setConfig((prev) => ({ ...prev, ...patch }));
    };

    const buildHeaders = (ep: EndpointDef): Record<string, string> => {
        const headers: Record<string, string> = { "X-Debug": "true" };
        if (ep.id === "cotizar") {
            headers["X-Mock-Origin-Street"] = config.origin_street;
            headers["X-Mock-Origin-Number"] = config.origin_number;
            headers["X-Mock-Origin-Zip"] = config.origin_zip;
        }
        if (ep.id === "crear-envio") {
            headers["X-Mock-Buyer-Name"] = config.buyer_name;
            headers["X-Mock-Buyer-Phone"] = config.buyer_phone;
        }
        return headers;
    };

    const buildRequestBody = (ep: EndpointDef): Record<string, unknown> | undefined => {
        switch (ep.id) {
            case "cotizar":
                return {
                    destination_address: {
                        street: config.dest_street,
                        number: config.dest_number,
                        zip: config.dest_zip,
                    },
                    product_id: generatePrefixedId("prd"),
                    weight_kg: config.weight_kg,
                    height_cm: config.height_cm,
                    width_cm: config.width_cm,
                    depth_cm: config.depth_cm,
                };
            case "reservar":
                return {
                    quote_id: flow.quote_id ?? generatePrefixedId("qte"),
                    order_id: flow.order_id ?? generatePrefixedId("ord"),
                };
            case "liberar":
                return {
                    quote_id: flow.quote_id ?? generatePrefixedId("qte"),
                    order_id: flow.order_id ?? generatePrefixedId("ord"),
                };
            case "crear-envio":
                return {
                    order_id: flow.order_id ?? generatePrefixedId("ord"),
                    seller_id: generatePrefixedId("usr"),
                    buyer_id: generatePrefixedId("usr"),
                };
            default:
                return undefined;
        }
    };

    const generateInternalCalls = (ep: EndpointDef): LogInternalCall[] => {
        const defs = INTERNAL_CALLS[ep.id];
        if (!defs) return [];

        return defs.map((def) => ({
            target: def.target,
            method: def.method,
            url: def.url,
            status: 200,
        }));
    };

    const handleSend = async (ep: EndpointDef) => {
        setStates((prev) => ({ ...prev, [ep.id]: "loading" }));

        const now = new Date();
        const timestamp = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        try {
            const headers = buildHeaders(ep);
            const requestBody = buildRequestBody(ep);

            const res = await fetch(ep.url, {
                method: ep.method,
                headers: { "Content-Type": "application/json", ...headers },
                body: requestBody ? JSON.stringify(requestBody) : undefined,
            });

            const text = await res.text();
            let body: string;
            let rawData: Record<string, unknown> | undefined;

            try {
                const parsed = JSON.parse(text) as Record<string, unknown>;
                delete parsed._trace;
                body = JSON.stringify(parsed, null, 2);
                rawData = parsed;
            } catch {
                body = text;
            }

            const entry: LogEntry = {
                id: generatePrefixedId("log"),
                timestamp,
                method: ep.method,
                url: ep.url,
                endpointLabel: ep.label,
                requestBody: requestBody ? JSON.stringify(requestBody, null, 2) : undefined,
                responseStatus: res.status,
                responseBody: body,
                internalCalls: generateInternalCalls(ep),
            };

            setLogEntries((prev) => [entry, ...prev]);
            setStates((prev) => ({ ...prev, [ep.id]: res.ok ? "success" : "error" }));

            if (res.ok && rawData) {
                if (ep.id === "cotizar" && rawData.quote_id) {
                    setFlow((prev) => ({ ...prev, quote_id: rawData.quote_id as string }));
                }
                if (ep.id === "reservar" && requestBody?.order_id) {
                    setFlow((prev) => ({ ...prev, order_id: requestBody.order_id as string }));
                }
                if (ep.id === "crear-envio" && rawData.shipping_id) {
                    setFlow((prev) => ({
                        ...prev,
                        shipping_id: rawData.shipping_id as string,
                        tracking_code: rawData.tracking_code as string,
                        status: rawData.status as string,
                    }));
                }
            }
        } catch (err) {
            const entry: LogEntry = {
                id: generatePrefixedId("log"),
                timestamp,
                method: ep.method,
                url: ep.url,
                endpointLabel: ep.label,
                responseStatus: 0,
                responseBody: `Error de conexion: ${err instanceof Error ? err.message : "desconocido"}`,
            };
            setLogEntries((prev) => [entry, ...prev]);
            setStates((prev) => ({ ...prev, [ep.id]: "error" }));
        }
    };

    const clearLog = () => setLogEntries([]);

    const resetAll = () => {
        setFlow({ quote_id: null, order_id: null, shipping_id: null, tracking_code: null, status: null });
        setStates({});
        setConfig(DEFAULT_CONFIG);
        setLogEntries([]);
    };

    const epGroups = {
        buyer: ENDPOINTS.filter((e) => e.app === "buyer"),
        payments: ENDPOINTS.filter((e) => e.app === "payments"),
        seller: ENDPOINTS.filter((e) => e.app === "seller"),
    };

    return (
        <div className="min-h-screen bg-cream p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-xl font-bold text-ink">API Playground</h1>
                    <span className="text-[10px] bg-bone text-ink-3 px-2 py-0.5 rounded-full font-semibold">dev</span>
                </div>
                <p className="text-sm text-ink-2 mb-5">
                    Simula el flujo completo de integracion entre aplicaciones del ecosistema UniHousing.
                </p>

                <div className="bg-paper border border-line rounded-r3 mb-6 overflow-hidden">
                    <button
                        onClick={() => setConfigOpen(!configOpen)}
                        className="w-full flex items-center gap-2 px-5 py-3 text-sm font-semibold text-ink hover:bg-cream/50 transition"
                    >
                        Configuracion
                        <span className="ml-auto text-ink-3 text-xs">{configOpen ? "▲" : "▼"}</span>
                    </button>
                    {configOpen && (
                        <div className="p-5 border-t border-line space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Fieldset title="Direccion de origen">
                                    <Input label="Calle" value={config.origin_street} onChange={(v) => updateConfig({ origin_street: v })} />
                                    <div className="flex gap-2">
                                        <Input label="Numero" value={config.origin_number} onChange={(v) => updateConfig({ origin_number: v })} className="flex-1" />
                                        <Input label="CP" value={config.origin_zip} onChange={(v) => updateConfig({ origin_zip: v })} className="w-24" />
                                    </div>
                                </Fieldset>
                                <Fieldset title="Direccion de destino">
                                    <Input label="Calle" value={config.dest_street} onChange={(v) => updateConfig({ dest_street: v })} />
                                    <div className="flex gap-2">
                                        <Input label="Numero" value={config.dest_number} onChange={(v) => updateConfig({ dest_number: v })} className="flex-1" />
                                        <Input label="CP" value={config.dest_zip} onChange={(v) => updateConfig({ dest_zip: v })} className="w-24" />
                                    </div>
                                </Fieldset>
                                <Fieldset title="Datos del comprador">
                                    <Input label="Nombre" value={config.buyer_name} onChange={(v) => updateConfig({ buyer_name: v })} />
                                    <Input label="Telefono" value={config.buyer_phone} onChange={(v) => updateConfig({ buyer_phone: v })} />
                                </Fieldset>
                            </div>
                            <Fieldset title="Dimensiones del paquete">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <Input label="Peso (kg)" type="number" value={String(config.weight_kg)} onChange={(v) => updateConfig({ weight_kg: Number(v) })} />
                                    <Input label="Alto (cm)" type="number" value={String(config.height_cm)} onChange={(v) => updateConfig({ height_cm: Number(v) })} />
                                    <Input label="Ancho (cm)" type="number" value={String(config.width_cm)} onChange={(v) => updateConfig({ width_cm: Number(v) })} />
                                    <Input label="Profundidad (cm)" type="number" value={String(config.depth_cm)} onChange={(v) => updateConfig({ depth_cm: Number(v) })} />
                                </div>
                            </Fieldset>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5">
                    <div className="space-y-4">
                        {Object.entries(epGroups).map(([appKey, endpoints]) => {
                            const meta = APP_META[appKey as keyof typeof APP_META];
                            const grp = epGroups[appKey as keyof typeof epGroups];
                            const step = endpoints[0]?.step ?? 1;
                            return (
                                <CompactAppCard key={appKey} step={step} meta={meta}>
                                    {grp.map((ep) => (
                                        <CompactEndpointItem
                                            key={ep.id}
                                            ep={ep}
                                            state={states[ep.id]}
                                            onSend={() => handleSend(ep)}
                                        />
                                    ))}
                                </CompactAppCard>
                            );
                        })}

                        <div className="bg-paper border border-line rounded-r3 p-4">
                            <h3 className="text-sm font-semibold text-ink mb-3">Estado del flujo</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-ink-3">Cotizacion</span>
                                    <span className={`font-mono font-medium ${flow.quote_id ? "text-success" : "text-ink-3"}`}>
                                        {flow.quote_id ? flow.quote_id.slice(0, 16) + "..." : "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-ink-3">Orden</span>
                                    <span className={`font-mono font-medium ${flow.order_id ? "text-success" : "text-ink-3"}`}>
                                        {flow.order_id ? flow.order_id.slice(0, 16) + "..." : "—"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-ink-3">Envio</span>
                                    <span className={`font-mono font-medium ${flow.shipping_id ? "text-success" : "text-ink-3"}`}>
                                        {flow.shipping_id ? flow.shipping_id.slice(0, 16) + "..." : "—"}
                                    </span>
                                </div>
                                {flow.tracking_code && (
                                    <div className="pt-2 border-t border-line">
                                        <div className="flex items-center justify-between">
                                            <span className="text-ink-3">Tracking</span>
                                            <span className="font-mono font-medium text-clay">{flow.tracking_code}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-ink-3">Estado</span>
                                            <span className="font-medium text-ink">{flow.status}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={resetAll}
                                className="mt-3 w-full text-[11px] text-ink-3 hover:text-ink transition-colors py-1 font-medium"
                            >
                                Reiniciar flujo
                            </button>
                        </div>
                    </div>

                    <div>
                        <TrafficLog entries={logEntries} onClear={clearLog} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border border-line rounded-r2 p-3">
            <legend className="text-[11px] font-semibold text-ink-3 uppercase tracking-wide mb-2">{title}</legend>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    type = "text",
    className,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className="block text-[10px] text-ink-3 font-medium mb-0.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-paper border border-line rounded-xl px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:border-clay focus:outline-none transition-colors"
            />
        </div>
    );
}

function CompactAppCard({
    step,
    meta,
    children,
}: {
    step: number;
    meta: { label: string; color: string };
    children: React.ReactNode;
}) {
    const stepColors = ["bg-bark", "bg-clay", "bg-sand"];
    return (
        <div className={`bg-paper border ${meta.color} rounded-r3 overflow-hidden`}>
            <div className="bg-bone/40 px-4 py-2.5 flex items-center gap-3 border-b border-line">
                <span className={`${stepColors[step - 1]} text-paper text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center`}>
                    {step}
                </span>
                <span className="text-sm font-semibold text-ink">{meta.label}</span>
            </div>
            <div className="p-3 space-y-2">{children}</div>
        </div>
    );
}

function CompactEndpointItem({
    ep,
    state,
    onSend,
}: {
    ep: EndpointDef;
    state?: RequestState;
    onSend: () => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onSend}
                disabled={state === "loading"}
                className="flex-1 bg-clay text-paper hover:bg-cocoa rounded-full h-9 px-4 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left truncate"
            >
                {state === "loading" ? "Enviando..." : ep.label}
            </button>
            {state === "success" && <span className="text-success text-xs font-semibold shrink-0">OK</span>}
            {state === "error" && <span className="text-danger text-xs font-semibold shrink-0">Error</span>}
        </div>
    );
}
