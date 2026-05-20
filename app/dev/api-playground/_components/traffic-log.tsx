"use client";

import { useState } from "react";

export interface LogInternalCall {
    target: string;
    method: string;
    url: string;
    status: number;
    responseBody?: string;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    method: string;
    url: string;
    endpointLabel: string;
    requestBody?: string;
    responseStatus: number;
    responseBody: string;
    internalCalls?: LogInternalCall[];
}

interface TrafficLogProps {
    entries: LogEntry[];
    onClear: () => void;
}

const TARGET_COLORS: Record<string, string> = {
    Seller: "border-l-sand text-sand",
    Buyer: "border-l-mist text-mist",
    Payments: "border-l-stone text-stone",
};

function MethodBadge({ method }: { method: string }) {
    const colors: Record<string, string> = {
        POST: "bg-success/10 text-success border border-success/20",
        GET: "bg-clay/10 text-clay border border-clay/20",
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${colors[method] || "bg-ink/10 text-ink border border-line"}`}>
            {method}
        </span>
    );
}

function StatusBadge({ status }: { status: number }) {
    const isOk = status >= 200 && status < 300;
    const bg = isOk ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20";
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${bg}`}>
            {status}
        </span>
    );
}

function CodeBlock({ label, json }: { label: string; json: string }) {
    return (
        <div className="mb-2">
            <span className="text-[11px] font-semibold text-ink-3 uppercase tracking-wide mb-1 block">{label}</span>
            <pre className="bg-bone rounded-xl p-3 font-mono text-xs text-ink overflow-auto max-h-40 whitespace-pre-wrap">{json}</pre>
        </div>
    );
}

function InternalCallCard({ call }: { call: LogInternalCall }) {
    const color = TARGET_COLORS[call.target] || "text-ink-3";
    return (
        <div className={`border-l-4 ${color.split(" ")[0]} bg-bone/40 rounded-r-lg px-3 py-2`}>
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold ${color.split(" ")[1]}`}>{call.target}</span>
                <MethodBadge method={call.method} />
                <span className="text-xs text-ink-2 font-mono truncate flex-1">{call.url}</span>
                <StatusBadge status={call.status} />
            </div>
            {call.responseBody && (
                <pre className="text-[11px] text-ink-2 font-mono overflow-auto max-h-20 whitespace-pre-wrap bg-paper rounded-lg p-2 mt-1">
                    {call.responseBody}
                </pre>
            )}
        </div>
    );
}

function LogEntryCard({ entry, isFirst }: { entry: LogEntry; isFirst: boolean }) {
    const [open, setOpen] = useState(isFirst);

    return (
        <div className="border border-line rounded-r2 overflow-hidden bg-paper">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cream/50 transition-colors text-left"
            >
                <span className="text-[11px] font-mono text-ink-3 shrink-0 w-14">{entry.timestamp}</span>
                <span className="text-xs font-semibold text-ink shrink-0 min-w-[80px] truncate">{entry.endpointLabel}</span>
                <MethodBadge method={entry.method} />
                <span className="text-xs text-ink-2 font-mono truncate flex-1">{entry.url}</span>
                <StatusBadge status={entry.responseStatus} />
                <span className="text-[10px] text-ink-3 shrink-0">{open ? "▲" : "▼"}</span>
            </button>

            {open && (
                <div className="px-4 pb-3 pt-1 border-t border-line space-y-2">
                    {entry.requestBody && (
                        <CodeBlock label="Request" json={entry.requestBody} />
                    )}
                    <CodeBlock label="Response" json={entry.responseBody} />

                    {entry.internalCalls && entry.internalCalls.length > 0 && (
                        <div>
                            <span className="text-[11px] font-semibold text-ink-3 uppercase tracking-wide mb-1.5 block">
                                Llamadas internas
                            </span>
                            <div className="space-y-1.5">
                                {entry.internalCalls.map((call, i) => (
                                    <InternalCallCard key={i} call={call} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function TrafficLog({ entries, onClear }: TrafficLogProps) {
    return (
        <div className="bg-paper border border-line rounded-r3 overflow-hidden">
            <div className="px-4 py-3 border-b border-line flex items-center justify-between bg-bone/30">
                <h3 className="text-sm font-semibold text-ink">Trafico en vivo</h3>
                {entries.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-[11px] text-ink-3 hover:text-ink transition-colors font-medium"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            <div className="flex flex-col divide-y divide-line max-h-[800px] overflow-y-auto">
                {entries.length === 0 ? (
                    <div className="p-6 text-center text-ink-3 text-sm">
                        Aun no hay trafico. Envia una request para verla aqui.
                    </div>
                ) : (
                    entries.map((entry, i) => (
                        <LogEntryCard key={entry.id} entry={entry} isFirst={i === 0} />
                    ))
                )}
            </div>
        </div>
    );
}
