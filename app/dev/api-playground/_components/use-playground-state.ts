"use client";

import { useState } from "react";
import { generatePrefixedId } from "@/lib/shared/server-utils";
import { DEFAULT_CONFIG, ENDPOINTS, INTERNAL_CALLS } from "./constants";
import type { PlaygroundConfig, EndpointDef, RequestState, FlowStatus, LogEntry, LogInternalCall } from "./types";

export function usePlaygroundState() {
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
        const headers: Record<string, string> = {
            "X-Debug": "true",
            "x-api-key-hash": process.env.NEXT_PUBLIC_INTERNAL_API_KEY_HASH ?? "",
        };
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

    const epGroups: Record<string, EndpointDef[]> = {
        buyer: ENDPOINTS.filter((e) => e.app === "buyer"),
        payments: ENDPOINTS.filter((e) => e.app === "payments"),
        seller: ENDPOINTS.filter((e) => e.app === "seller"),
    };

    return {
        configOpen,
        setConfigOpen,
        config,
        updateConfig,
        states,
        flow,
        logEntries,
        handleSend,
        clearLog,
        resetAll,
        epGroups,
    };
}
