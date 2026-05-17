"use client";

import { useState, useCallback } from "react";

type RequestState = "idle" | "loading" | "success" | "error";

type TraceEntry = {
    timestamp: string;
    target: string;
    method: string;
    url: string;
    request_body?: unknown;
    response_status: number;
    response_body?: unknown;
};

type EndpointDef = {
    id: string;
    label: string;
    app: "buyer" | "payments" | "seller";
    step: number;
    method: string;
    url: string;
    description: string;
    defaultBody: string;
};

type PlaygroundConfig = {
    dest_street: string;
    dest_number: string;
    dest_zip: string;
    seller_id: string;
    buyer_id: string;
    mock_origin_street: string;
    mock_origin_number: string;
    mock_origin_zip: string;
    mock_buyer_name: string;
    mock_buyer_phone: string;
};

const DEFAULT_CONFIG: PlaygroundConfig = {
    dest_street: "Av. San Martín",
    dest_number: "123",
    dest_zip: "8000",
    seller_id: "usr_01HXYZSELLER1234567890",
    buyer_id: "usr_01HXYZBUYER1234567890",
    mock_origin_street: "San Martín",
    mock_origin_number: "123",
    mock_origin_zip: "8000",
    mock_buyer_name: "Carlos Pérez",
    mock_buyer_phone: "2915550101",
};

function buildCotizarBody(config: PlaygroundConfig): string {
    return JSON.stringify(
        {
            destination_address: { street: config.dest_street, number: config.dest_number, zip: config.dest_zip },
            product_id: "prd_01HXYZ1234567890ABCDEF",
            weight_kg: 15,
            height_cm: 80,
            width_cm: 100,
            depth_cm: 50,
        },
        null,
        2
    );
}

function buildEnvioBody(config: PlaygroundConfig): string {
    return JSON.stringify(
        {
            order_id: "ord_01HXYZ1234567890ABCDEF",
            seller_id: config.seller_id,
            buyer_id: config.buyer_id,
        },
        null,
        2
    );
}

function buildReservarBody(): string {
    return JSON.stringify(
        { quote_id: "qte_01HXYZ1234567890ABCDEF", order_id: "ord_01HXYZ1234567890ABCDEF" },
        null,
        2
    );
}

function buildLiberarBody(): string {
    return JSON.stringify(
        { quote_id: "qte_01HXYZ1234567890ABCDEF", order_id: "ord_01HXYZ1234567890ABCDEF" },
        null,
        2
    );
}

function getDefaultBodies(config: PlaygroundConfig): Record<string, string> {
    return {
        cotizar: buildCotizarBody(config),
        reservar: buildReservarBody(),
        liberar: buildLiberarBody(),
        "crear-envio": buildEnvioBody(config),
        "ver-ruta": "{}",
    };
}

const ENDPOINTS: EndpointDef[] = [
    {
        id: "cotizar",
        app: "buyer",
        step: 1,
        label: "Cotizar envío",
        method: "POST",
        url: "/api/shipping/quotes",
        description:
            "El comprador solicita una cotización de envío para un producto. Se calcula el precio según peso, dimensiones y tarifas vigentes.",
        defaultBody: buildCotizarBody(DEFAULT_CONFIG),
    },
    {
        id: "reservar",
        app: "payments",
        step: 2,
        label: "Reservar cotización",
        method: "POST",
        url: "/api/shipping/quotes/reserve",
        description:
            "Payments App vincula la cotización con una orden de compra. La cotización queda reservada y no puede ser usada por otra orden.",
        defaultBody: buildReservarBody(),
    },
    {
        id: "liberar",
        app: "payments",
        step: 2,
        label: "Liberar reserva",
        method: "POST",
        url: "/api/shipping/quotes/release",
        description:
            "Si el pago se rechaza, Payments App libera la cotización para que pueda ser reutilizada por otra orden.",
        defaultBody: buildLiberarBody(),
    },
    {
        id: "crear-envio",
        app: "seller",
        step: 3,
        label: "Crear envío",
        method: "POST",
        url: "/api/shipping/shipments",
        description:
            "Cuando el pago se confirma, el vendedor solicita la creación del envío. Se genera un código de seguimiento y el envío queda listo para ser tomado por un operador logístico.",
        defaultBody: buildEnvioBody(DEFAULT_CONFIG),
    },
    {
        id: "ver-ruta",
        app: "seller",
        step: 3,
        label: "Ver ruta en mapa",
        method: "GET",
        url: "/api/shipping/shipments/{shipment_id}/route",
        description:
            "Obtiene la geometría de la ruta entre la dirección de retiro y la de entrega del envío, usando OpenRouteService.",
        defaultBody: "{}",
    },
];

const APP_INFO: Record<string, { label: string; icon: string; color: string }> = {
    buyer: { label: "Buyer App", icon: "📱", color: "border-blue-600" },
    payments: { label: "Payments App", icon: "💳", color: "border-amber-600" },
    seller: { label: "Seller App", icon: "🏪", color: "border-green-600" },
};

type FlowStatus = {
    quote_id: string | null;
    order_id: string | null;
    shipping_id: string | null;
    tracking_code: string | null;
    status: string | null;
};

export default function ApiPlaygroundPage() {
    const [configOpen, setConfigOpen] = useState(true);
    const [config, setConfig] = useState<PlaygroundConfig>(DEFAULT_CONFIG);
    const [bodies, setBodies] = useState<Record<string, string>>(() => getDefaultBodies(DEFAULT_CONFIG));
    const [results, setResults] = useState<Record<string, { status: number; body: string; trace?: TraceEntry[] } | null>>({});
    const [states, setStates] = useState<Record<string, RequestState>>({});
    const [flow, setFlow] = useState<FlowStatus>({
        quote_id: null,
        order_id: null,
        shipping_id: null,
        tracking_code: null,
        status: null,
    });

    const syncConfigToBodies = useCallback((cfg: PlaygroundConfig) => {
        setBodies((prev) => ({
            ...prev,
            cotizar: buildCotizarBody(cfg),
            "crear-envio": buildEnvioBody(cfg),
        }));
    }, []);

    const updateConfig = (patch: Partial<PlaygroundConfig>) => {
        const next = { ...config, ...patch };
        setConfig(next);
        syncConfigToBodies(next);
    };

    const handleBodyChange = (id: string, value: string) => {
        setBodies((prev) => ({ ...prev, [id]: value }));
    };

    const updateDefaultBody = (id: string, key: string, value: string) => {
        try {
            const parsed = JSON.parse(bodies[id]);
            parsed[key] = value;
            setBodies((prev) => ({ ...prev, [id]: JSON.stringify(parsed, null, 2) }));
        } catch {}
    };

    const buildMockHeaders = (ep: EndpointDef): Record<string, string> => {
        const headers: Record<string, string> = {};
        if (ep.id === "cotizar") {
            headers["X-Mock-Origin-Street"] = config.mock_origin_street;
            headers["X-Mock-Origin-Number"] = config.mock_origin_number;
            headers["X-Mock-Origin-Zip"] = config.mock_origin_zip;
        }
        if (ep.id === "crear-envio") {
            headers["X-Mock-Buyer-Name"] = config.mock_buyer_name;
            headers["X-Mock-Buyer-Phone"] = config.mock_buyer_phone;
        }
        return headers;
    };

    const handleSend = async (ep: EndpointDef) => {
        setStates((prev) => ({ ...prev, [ep.id]: "loading" }));
        setResults((prev) => ({ ...prev, [ep.id]: null }));

        try {
            const url = ep.url.replace("{shipping_id}", flow.shipping_id ?? "");
            const mockHeaders = buildMockHeaders(ep);
            let res: Response;
            let requestBody: Record<string, unknown> | undefined;

            const baseHeaders: Record<string, string> = { "X-Debug": "true", ...mockHeaders };

            if (ep.method === "GET") {
                res = await fetch(url, { headers: baseHeaders });
            } else {
                requestBody = JSON.parse(bodies[ep.id]);
                res = await fetch(url, {
                    method: ep.method,
                    headers: { "Content-Type": "application/json", ...baseHeaders },
                    body: JSON.stringify(requestBody),
                });
            }

            const text = await res.text();
            let body: string;
            let trace: TraceEntry[] | undefined;
            try {
                const data = JSON.parse(text);
                trace = data._trace;
                delete data._trace;
                body = JSON.stringify(data, null, 2);
            } catch {
                body = text;
            }
            setResults((prev) => ({ ...prev, [ep.id]: { status: res.status, body, trace } }));
            setStates((prev) => ({ ...prev, [ep.id]: res.ok ? "success" : "error" }));

            if (res.ok && body) {
                try {
                    const data = JSON.parse(text);
                    if (ep.id === "cotizar" && data.quote_id) {
                        setFlow((prev) => ({ ...prev, quote_id: data.quote_id }));
                        updateDefaultBody("reservar", "quote_id", data.quote_id);
                        updateDefaultBody("liberar", "quote_id", data.quote_id);
                    }
                    if (ep.id === "reservar" && requestBody?.order_id) {
                        setFlow((prev) => ({ ...prev, order_id: requestBody.order_id as string }));
                        updateDefaultBody("crear-envio", "order_id", requestBody.order_id as string);
                        updateDefaultBody("liberar", "order_id", requestBody.order_id as string);
                    }
                    if (ep.id === "crear-envio" && data.shipping_id) {
                        setFlow((prev) => ({
                            ...prev,
                            shipping_id: data.shipping_id,
                            tracking_code: data.tracking_code,
                            status: data.status,
                        }));
                    }
                } catch {}
            }
        } catch (err) {
            setResults((prev) => ({
                ...prev,
                [ep.id]: { status: 0, body: `Error de conexión: ${err instanceof Error ? err.message : "desconocido"}` },
            }));
            setStates((prev) => ({ ...prev, [ep.id]: "error" }));
        }
    };

    const epGroups = {
        buyer: ENDPOINTS.filter((e) => e.app === "buyer"),
        payments: ENDPOINTS.filter((e) => e.app === "payments"),
        seller: ENDPOINTS.filter((e) => e.app === "seller"),
    };

    const getStepBadge = (step: number) => {
        const colors = ["bg-blue-600", "bg-amber-600", "bg-green-600"];
        return (
            <span className={`${colors[step - 1]} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center`}>
                {step}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold">API Playground</h1>
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">dev</span>
                </div>
                <p className="text-gray-400 mb-4">
                    Simulá el flujo completo de integración entre aplicaciones del ecosistema UniHousing.
                </p>

                {/* Config Panel */}
                <div className="bg-gray-900 rounded-lg border border-gray-700 mb-6 overflow-hidden">
                    <button
                        onClick={() => setConfigOpen(!configOpen)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-800 transition"
                    >
                        <span>⚙️ Configuración</span>
                        <span className="ml-auto text-gray-500">{configOpen ? "▲" : "▼"}</span>
                    </button>
                    {configOpen && (
                        <div className="p-4 border-t border-gray-700 space-y-3">
                            {/* Primera fila: destino + IDs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <fieldset className="border border-gray-700 rounded p-3">
                                    <legend className="text-xs text-gray-500 px-1">Dirección destino</legend>
                                    <label className="block text-xs text-gray-400 mb-1">street</label>
                                    <input
                                        value={config.dest_street}
                                        onChange={(e) => updateConfig({ dest_street: e.target.value })}
                                        className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-xs font-mono text-gray-200 mb-2"
                                    />
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 mb-1">number</label>
                                            <input
                                                value={config.dest_number}
                                                onChange={(e) => updateConfig({ dest_number: e.target.value })}
                                                className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-xs font-mono text-gray-200"
                                            />
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs text-gray-400 mb-1">zip</label>
                                            <input
                                                value={config.dest_zip}
                                                onChange={(e) => updateConfig({ dest_zip: e.target.value })}
                                                className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-xs font-mono text-gray-200"
                                            />
                                        </div>
                                    </div>
                                </fieldset>

                                <fieldset className="border border-gray-700 rounded p-3">
                                    <legend className="text-xs text-gray-500 px-1">Vendedor / Comprador</legend>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 mb-1">seller_id</label>
                                            <input
                                                value={config.seller_id}
                                                onChange={(e) => updateConfig({ seller_id: e.target.value })}
                                                className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-xs font-mono text-gray-200"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-400 mb-1">buyer_id</label>
                                            <input
                                                value={config.buyer_id}
                                                onChange={(e) => updateConfig({ buyer_id: e.target.value })}
                                                className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-xs font-mono text-gray-200"
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                            </div>

                            {/* Segunda fila: datos simulados */}
                            <fieldset className="border border-gray-700 rounded p-3">
                                <legend className="text-xs text-amber-500 px-1">Datos simulados de otros sistemas</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-1.5">Seller App — dirección de origen</p>
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-gray-400 mb-0.5">street</label>
                                                <input
                                                    value={config.mock_origin_street}
                                                    onChange={(e) => updateConfig({ mock_origin_street: e.target.value })}
                                                    className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-xs font-mono text-gray-200"
                                                />
                                            </div>
                                            <div className="w-20">
                                                <label className="block text-[10px] text-gray-400 mb-0.5">number</label>
                                                <input
                                                    value={config.mock_origin_number}
                                                    onChange={(e) => updateConfig({ mock_origin_number: e.target.value })}
                                                    className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-xs font-mono text-gray-200"
                                                />
                                            </div>
                                            <div className="w-20">
                                                <label className="block text-[10px] text-gray-400 mb-0.5">zip</label>
                                                <input
                                                    value={config.mock_origin_zip}
                                                    onChange={(e) => updateConfig({ mock_origin_zip: e.target.value })}
                                                    className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-xs font-mono text-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-gray-500 mb-1.5">Buyer App — datos del comprador</p>
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <label className="block text-[10px] text-gray-400 mb-0.5">full_name</label>
                                                <input
                                                    value={config.mock_buyer_name}
                                                    onChange={(e) => updateConfig({ mock_buyer_name: e.target.value })}
                                                    className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-xs font-mono text-gray-200"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <label className="block text-[10px] text-gray-400 mb-0.5">phone</label>
                                                <input
                                                    value={config.mock_buyer_phone}
                                                    onChange={(e) => updateConfig({ mock_buyer_phone: e.target.value })}
                                                    className="w-full bg-gray-950 border border-gray-700 rounded px-2 py-1.5 text-xs font-mono text-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        {/* Buyer App */}
                        <div className="bg-gray-900 rounded-lg border border-blue-800 overflow-hidden">
                            <div className="bg-blue-950 px-4 py-2 flex items-center gap-2 border-b border-blue-800">
                                {getStepBadge(1)}
                                <span className="text-sm font-semibold text-blue-200">
                                    {APP_INFO.buyer.icon} {APP_INFO.buyer.label}
                                </span>
                                <span className="text-xs text-blue-400 ml-auto">consulta cotización de envío</span>
                            </div>
                            <div className="p-4">
                                {epGroups.buyer.map((ep) => (
                                    <EndpointCard
                                        key={ep.id}
                                        ep={ep}
                                        body={bodies[ep.id]}
                                        onBodyChange={(v) => handleBodyChange(ep.id, v)}
                                        onSend={() => handleSend(ep)}
                                        state={states[ep.id]}
                                        result={results[ep.id]}
                                        shippingId={flow.shipping_id}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Payments App */}
                        <div className="bg-gray-900 rounded-lg border border-amber-800 overflow-hidden">
                            <div className="bg-amber-950 px-4 py-2 flex items-center gap-2 border-b border-amber-800">
                                {getStepBadge(2)}
                                <span className="text-sm font-semibold text-amber-200">
                                    {APP_INFO.payments.icon} {APP_INFO.payments.label}
                                </span>
                                <span className="text-xs text-amber-400 ml-auto">
                                    gestiona reserva de cotización
                                </span>
                            </div>
                            <div className="p-4 space-y-4">
                                {epGroups.payments.map((ep) => (
                                    <EndpointCard
                                        key={ep.id}
                                        ep={ep}
                                        body={bodies[ep.id]}
                                        onBodyChange={(v) => handleBodyChange(ep.id, v)}
                                        onSend={() => handleSend(ep)}
                                        state={states[ep.id]}
                                        result={results[ep.id]}
                                        shippingId={flow.shipping_id}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Seller App */}
                        <div className="bg-gray-900 rounded-lg border border-green-800 overflow-hidden">
                            <div className="bg-green-950 px-4 py-2 flex items-center gap-2 border-b border-green-800">
                                {getStepBadge(3)}
                                <span className="text-sm font-semibold text-green-200">
                                    {APP_INFO.seller.icon} {APP_INFO.seller.label}
                                </span>
                                <span className="text-xs text-green-400 ml-auto">
                                    solicita creación del envío
                                </span>
                            </div>
                            <div className="p-4">
                                {epGroups.seller.map((ep) => (
                                    <EndpointCard
                                        key={ep.id}
                                        ep={ep}
                                        body={bodies[ep.id]}
                                        onBodyChange={(v) => handleBodyChange(ep.id, v)}
                                        onSend={() => handleSend(ep)}
                                        state={states[ep.id]}
                                        result={results[ep.id]}
                                        shippingId={flow.shipping_id}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Estado del flujo */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 sticky top-6">
                            <h3 className="text-sm font-semibold text-gray-300 mb-3">Estado del flujo</h3>

                            <div className="space-y-3">
                                <FlowItem
                                    label="Cotización"
                                    value={flow.quote_id ? flow.quote_id : "—"}
                                    done={!!flow.quote_id}
                                    icon="📋"
                                />
                                <FlowArrow />
                                <FlowItem
                                    label="Reserva"
                                    value={flow.order_id ? flow.order_id : "—"}
                                    done={!!flow.order_id}
                                    icon="🔒"
                                />
                                <FlowArrow />
                                <FlowItem
                                    label="Envío"
                                    value={flow.shipping_id ? flow.shipping_id : "—"}
                                    done={!!flow.shipping_id}
                                    icon="📦"
                                />
                            </div>

                            {flow.tracking_code && (
                                <div className="mt-4 pt-3 border-t border-gray-700">
                                    <span className="text-xs text-gray-500">Código de seguimiento</span>
                                    <p className="text-sm font-mono text-green-400 mt-1">{flow.tracking_code}</p>
                                    <span className="text-xs text-gray-500 mt-2 block">Estado: {flow.status}</span>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setFlow({ quote_id: null, order_id: null, shipping_id: null, tracking_code: null, status: null });
                                    setResults({});
                                    setStates({});
                                    setConfig(DEFAULT_CONFIG);
                                    setBodies(getDefaultBodies(DEFAULT_CONFIG));
                                }}
                                className="mt-4 w-full text-xs text-gray-500 hover:text-gray-300 transition py-1"
                            >
                                ↺ Reiniciar flujo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EndpointCard({
    ep,
    body,
    onBodyChange,
    onSend,
    state,
    result,
    shippingId,
}: {
    ep: EndpointDef;
    body: string;
    onBodyChange: (v: string) => void;
    onSend: () => void;
    state?: RequestState;
    result: { status: number; body: string; trace?: TraceEntry[] } | null;
    shippingId?: string | null;
}) {
    const resolvedUrl = ep.url.replace("{shipping_id}", shippingId ?? "");
    const hasPlaceholder = resolvedUrl.includes("{");
    const isGet = ep.method === "GET";

    return (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-200">{ep.label}</span>
                <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-xs font-mono">
                    {ep.method}
                </span>
                <span className="text-xs font-mono text-gray-500">{resolvedUrl}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{ep.description}</p>

            {!isGet && (
                <textarea
                    value={body}
                    onChange={(e) => onBodyChange(e.target.value)}
                    rows={6}
                    className="w-full bg-gray-950 border border-gray-700 rounded p-2.5 font-mono text-xs text-gray-200 resize-y mb-2"
                />
            )}

            <div className="flex items-center gap-2">
                <button
                    onClick={onSend}
                    disabled={state === "loading" || hasPlaceholder}
                    className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded text-sm font-medium transition"
                >
                    {state === "loading" ? "Enviando..." : "Enviar"}
                </button>
                {state === "success" && <span className="text-green-400 text-xs">✓ OK</span>}
                {state === "error" && <span className="text-red-400 text-xs">✗ Error</span>}
                {hasPlaceholder && <span className="text-amber-400 text-xs">⚠ Crear envío primero</span>}
            </div>

            {result && (
                <div className="mt-2 space-y-2">
                    <div className="bg-gray-950 border border-gray-700 rounded p-2.5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">Response:</span>
                            <span
                                className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                                    result.status < 300 ? "bg-green-800 text-green-200" : "bg-red-800 text-red-200"
                                }`}
                            >
                                {result.status}
                            </span>
                        </div>
                        <pre className="text-xs text-gray-300 overflow-auto max-h-48 whitespace-pre-wrap">
                            {result.body}
                        </pre>
                    </div>

                    {result.trace && result.trace.length > 0 && (
                        <div className="bg-gray-950 border border-purple-800 rounded p-2.5">
                            <div className="flex items-center gap-1.5 mb-2">
                                <span className="text-xs text-purple-400 font-medium">🔁 Mensajes enviados a otras apps</span>
                            </div>
                            <div className="space-y-2">
                                {result.trace.map((entry, i) => (
                                    <div key={i} className="bg-gray-900 border border-gray-700 rounded p-2">
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-gray-400 font-mono">{entry.method}</span>
                                            <span className="text-gray-300 font-mono truncate">{entry.url}</span>
                                            <span className="ml-auto text-purple-300">→ {entry.target}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs">
                                            <span className={`px-1 py-0.5 rounded font-mono ${entry.response_status < 300 ? "bg-green-800 text-green-200" : "bg-red-800 text-red-200"}`}>
                                                {entry.response_status}
                                            </span>
                                        </div>
                                        {!!entry.response_body && (
                                            <pre className="mt-1 text-xs text-gray-400 overflow-auto max-h-24 whitespace-pre-wrap bg-gray-950 rounded p-1.5">
                                                {JSON.stringify(entry.response_body, null, 2) ?? ""}
                                            </pre>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function FlowItem({
    label,
    value,
    done,
    icon,
}: {
    label: string;
    value: string;
    done: boolean;
    icon: string;
}) {
    return (
        <div className={`p-2 rounded border text-xs ${done ? "border-green-700 bg-green-950" : "border-gray-700 bg-gray-950"}`}>
            <div className="flex items-center gap-1.5">
                <span>{icon}</span>
                <span className="text-gray-400">{label}</span>
            </div>
            <p className={`font-mono mt-0.5 ${done ? "text-green-300" : "text-gray-600"}`}>
                {value}
            </p>
        </div>
    );
}

function FlowArrow() {
    return (
        <div className="flex justify-center text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        </div>
    );
}
