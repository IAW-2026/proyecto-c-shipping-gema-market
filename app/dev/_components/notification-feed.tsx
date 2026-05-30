"use client";

import { useState, useRef } from "react";
import { Trash2, Filter } from "lucide-react";

type TargetType = "SELLER" | "BUYER" | "API";

interface NotificationEntry {
    id: string;
    timestamp: string;
    target: TargetType;
    method: string;
    url: string;
    body?: Record<string, unknown>;
    status: number;
    response?: Record<string, unknown>;
    transition?: string;
}

const MOCK_ENTRIES: NotificationEntry[] = [
    {
        id: "1",
        timestamp: "14:32:15",
        target: "SELLER",
        method: "POST",
        url: "/api/seller/ventas/ord_xxx1/estado-envio",
        body: {
            order_id: "ord_xxx1",
            shipping_id: "shp_01K...",
            status: "picked_up",
            tracking_code: "BB-000001-2026",
            updated_at: "2026-05-30T14:32:15.000Z",
        },
        status: 200,
        response: { success: true },
        transition: "pending_pickup -> picked_up",
    },
    {
        id: "2",
        timestamp: "14:32:15",
        target: "BUYER",
        method: "POST",
        url: "/api/buyer/ordenes/ord_xxx1/estado-envio",
        body: {
            shipping_id: "shp_01K...",
            status: "picked_up",
            tracking_code: "BB-000001-2026",
            updated_at: "2026-05-30T14:32:15.000Z",
        },
        status: 200,
        response: { received: true, order_id: "ord_xxx1" },
        transition: "pending_pickup -> picked_up",
    },
    {
        id: "3",
        timestamp: "14:30:00",
        target: "API",
        method: "GET",
        url: "/api/seller/productos/prd_xxx1/direccion-origen",
        status: 200,
        response: { origin_address: { street: "Avenida Alem", number: "1250", zip: "8000" } },
    },
    {
        id: "4",
        timestamp: "14:29:58",
        target: "API",
        method: "POST",
        url: "/api/buyer/usr_xxx",
        status: 200,
        response: { full_name: "Maria Garcia", phone_number: "2915550101", email: "maria.garcia@email.com" },
    },
    {
        id: "5",
        timestamp: "14:28:30",
        target: "SELLER",
        method: "POST",
        url: "/api/seller/ventas/ord_xxx2/estado-envio",
        body: {
            order_id: "ord_xxx2",
            shipping_id: "shp_01K...",
            status: "in_transit",
            tracking_code: "BB-000002-2026",
            updated_at: "2026-05-30T14:28:30.000Z",
        },
        status: 200,
        response: { success: true },
        transition: "picked_up -> in_transit",
    },
    {
        id: "6",
        timestamp: "14:28:30",
        target: "BUYER",
        method: "POST",
        url: "/api/buyer/ordenes/ord_xxx2/estado-envio",
        body: {
            shipping_id: "shp_01K...",
            status: "in_transit",
            tracking_code: "BB-000002-2026",
            updated_at: "2026-05-30T14:28:30.000Z",
        },
        status: 200,
        response: { received: true, order_id: "ord_xxx2" },
        transition: "picked_up -> in_transit",
    },
    {
        id: "7",
        timestamp: "14:25:10",
        target: "SELLER",
        method: "POST",
        url: "/api/seller/ventas/ord_xxx3/estado-envio",
        body: {
            order_id: "ord_xxx3",
            shipping_id: "shp_01K...",
            status: "delivered",
            tracking_code: "BB-000003-2026",
            updated_at: "2026-05-30T14:25:10.000Z",
        },
        status: 200,
        response: { success: true },
        transition: "in_transit -> delivered",
    },
    {
        id: "8",
        timestamp: "14:25:10",
        target: "BUYER",
        method: "POST",
        url: "/api/buyer/ordenes/ord_xxx3/estado-envio",
        body: {
            shipping_id: "shp_01K...",
            status: "delivered",
            tracking_code: "BB-000003-2026",
            updated_at: "2026-05-30T14:25:10.000Z",
        },
        status: 200,
        response: { received: true, order_id: "ord_xxx3" },
        transition: "in_transit -> delivered",
    },
];

const TARGET_COLORS: Record<TargetType, string> = {
    SELLER: "text-yellow-400",
    BUYER: "text-cyan-400",
    API: "text-green-400",
};

const TRANSITION_COLORS: Record<string, string> = {
    delivered: "text-green-400",
    in_transit: "text-blue-400",
    picked_up: "text-yellow-400",
    pending_pickup: "text-orange-400",
    waiting_for_courier: "text-gray-500",
};

function getTransitionColor(transition?: string): string {
    if (!transition) return "text-gray-500";
    for (const [key, color] of Object.entries(TRANSITION_COLORS)) {
        if (transition.includes(key)) return color;
    }
    return "text-gray-500";
}

function EntryCard({ entry }: { entry: NotificationEntry }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-gray-600 last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-900 transition-colors"
            >
                <div className="flex items-center gap-2 font-mono text-sm">
                    <span className="text-gray-400 shrink-0 w-[72px]">{entry.timestamp}</span>
                    <span className={`font-bold shrink-0 w-[60px] ${TARGET_COLORS[entry.target]}`}>
                        {entry.target}
                    </span>
                    <span className="text-gray-400 shrink-0 w-[36px]">{entry.method}</span>
                    <span className="text-white truncate flex-1">{entry.url}</span>
                    <span className={`shrink-0 ${entry.status === 200 ? "text-green-400" : "text-red-400"}`}>
                        {entry.status === 200 ? "200 OK" : entry.status}
                    </span>
                </div>
                {entry.transition && (
                    <div className={`font-mono text-xs mt-1 ml-[172px] ${getTransitionColor(entry.transition)}`}>
                        {entry.transition}
                    </div>
                )}
            </button>

            {open && (
                <div className="px-4 pb-3 pt-1 bg-gray-900/60 border-t border-gray-600">
                    {entry.body && (
                        <div className="mb-2">
                            <span className="text-xs text-gray-400 uppercase tracking-wide font-mono block mb-1">
                                Body
                            </span>
                            <pre className="text-sm text-white font-mono bg-black rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap border border-gray-600">
                                {JSON.stringify(entry.body, null, 2)}
                            </pre>
                        </div>
                    )}
                    {entry.response && (
                        <div>
                            <span className="text-xs text-gray-400 uppercase tracking-wide font-mono block mb-1">
                                Response
                            </span>
                            <pre className="text-sm text-green-300 font-mono bg-black rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap border border-gray-600">
                                {JSON.stringify(entry.response, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function NotificationFeed() {
    const [entries, setEntries] = useState<NotificationEntry[]>(MOCK_ENTRIES);
    const [filter, setFilter] = useState<"ALL" | TargetType>("ALL");
    const scrollRef = useRef<HTMLDivElement>(null);

    const filtered = filter === "ALL" ? entries : entries.filter((e) => e.target === filter);

    const handleClear = () => {
        setEntries([]);
    };

    return (
        <div
            className="bg-black rounded-r2 overflow-hidden flex flex-col"
            style={{ height: "calc(100vh - 240px)", minHeight: "400px", maxHeight: "calc(100vh - 240px)" }}
        >
            <div className="px-4 py-3 border-b border-gray-600 flex items-center justify-between bg-gray-800 shrink-0">
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-white font-mono">Consola de Notificaciones</h3>
                    <span className="flex items-center gap-1.5 text-[11px] text-green-400 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Mock
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as typeof filter)}
                            className="bg-black border border-gray-600 rounded-lg pl-7 pr-2 py-1 text-[11px] text-gray-300 font-mono focus:border-gray-400 focus:outline-none"
                        >
                            <option value="ALL">Todos</option>
                            <option value="SELLER">Seller</option>
                            <option value="BUYER">Buyer</option>
                            <option value="API">API Calls</option>
                        </select>
                    </div>
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors font-mono"
                    >
                        <Trash2 size={12} />
                        Limpiar
                    </button>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 font-mono text-base">
                        No hay notificaciones. Realiza una accion para verlas aqui.
                    </div>
                ) : (
                    filtered.map((entry) => (
                        <EntryCard key={entry.id} entry={entry} />
                    ))
                )}
            </div>

            <div className="px-4 py-2 border-t border-gray-600 bg-gray-800/50 shrink-0">
                <span className="text-xs text-gray-400 font-mono">
                    {filtered.length} mensaje{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>
        </div>
    );
}
