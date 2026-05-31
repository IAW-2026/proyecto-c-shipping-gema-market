"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Filter, RefreshCw, Radio } from "lucide-react";
import { getNotificationsAction, clearNotificationsAction } from "./notification-feed-action";
import type { NotificationTarget, NotificationEntry } from "@/lib/utils/notification-registry";

const TARGET_COLORS: Record<NotificationTarget, string> = {
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
    const [entries, setEntries] = useState<NotificationEntry[]>([]);
    const [filter, setFilter] = useState<"ALL" | NotificationTarget>("ALL");
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const data = await getNotificationsAction(filter === "ALL" ? undefined : filter);
        setEntries(data);
        setLoading(false);
    }, [filter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, [autoRefresh, fetchData]);

    const handleClear = async () => {
        await clearNotificationsAction();
        setEntries([]);
    };

    const filtered = filter === "ALL" ? entries : entries.filter((e) => e.target === filter);

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
                        {autoRefresh ? "Live" : "Paused"}
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
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors font-mono disabled:opacity-50"
                    >
                        <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`flex items-center gap-1.5 text-[11px] font-mono transition-colors ${
                            autoRefresh ? "text-green-400 hover:text-green-300" : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        <Radio size={12} />
                    </button>
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors font-mono"
                    >
                        <Trash2 size={12} />
                        Limpiar
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
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
