"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { dbExplorerAction } from "./db-explorer-action";

const TABLES = ["User", "Shipment", "Rate", "TrackingSequence"];

export function DbExplorer() {
    const [selectedTable, setSelectedTable] = useState("User");
    const [columns, setColumns] = useState<string[]>([]);
    const [rows, setRows] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async (table: string) => {
        setLoading(true);
        const result = await dbExplorerAction(table);
        setColumns(result.columns);
        setRows(result.rows);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData(selectedTable);
    }, [selectedTable, fetchData]);

    const handleRefresh = () => {
        fetchData(selectedTable);
    };

    function cellValue(col: string, value: unknown): React.ReactNode {
        if (value === null || value === undefined) {
            return <span className="text-ink-3">—</span>;
        }
        if (col === "banned") {
            return (
                <span className={value ? "text-danger font-semibold" : "text-success"}>
                    {value ? "si" : "no"}
                </span>
            );
        }
        if (col === "status") {
            const statusColor: Record<string, string> = {
                delivered: "text-success",
                in_transit: "text-cocoa",
                picked_up: "text-cocoa",
                pending_pickup: "text-ink-2",
                waiting_for_courier: "text-ink-3",
            };
            return <span className={`font-semibold ${statusColor[String(value)] || "text-ink-2"}`}>{String(value)}</span>;
        }
        if (col === "price" || col === "price_per_km") {
            return <span className="text-ink-2">${String(value)}</span>;
        }
        if (col === "weight") {
            return <span className="text-ink-2">{String(value)} kg</span>;
        }
        if (col === "weight_range") {
            return <span className="text-ink-2">{String(value)}</span>;
        }
        const str = String(value);
        if (str.length > 20) {
            return <span className="text-ink-2" title={str}>{str.slice(0, 20)}...</span>;
        }
        return <span className="text-ink-2">{str}</span>;
    }

    return (
        <div className="bg-paper border border-line rounded-r3 overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink">Explorador de Base de Datos</h3>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="bg-cream border border-line rounded-xl px-3 py-1.5 text-xs font-mono text-ink focus:border-clay focus:outline-none transition-colors"
                    >
                        {TABLES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-1.5 bg-clay text-paper hover:bg-cocoa rounded-xl px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw size={20} className="text-ink-3 animate-spin" />
                        <span className="text-sm text-ink-3 ml-2">Cargando...</span>
                    </div>
                ) : rows.length === 0 ? (
                    <div className="py-12 text-center text-sm text-ink-3">
                        No hay datos en la tabla {selectedTable}.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead key={col}>{col}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row, i) => (
                                <TableRow key={i}>
                                    {columns.map((col) => (
                                        <TableCell key={col}>
                                            <span className="font-mono text-xs">
                                                {cellValue(col, row[col])}
                                            </span>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
