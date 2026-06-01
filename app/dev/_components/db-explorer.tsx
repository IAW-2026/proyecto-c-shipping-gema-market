"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { dbExplorerAction } from "./db-explorer-action";

const TABLES = ["User", "Shipment", "Rate", "TrackingSequence"];

export function DbExplorer() {
    const [selectedTable, setSelectedTable] = useState("User");
    const [columns, setColumns] = useState<string[]>([]);
    const [rows, setRows] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(false);
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [searchId, setSearchId] = useState("");

    const fetchData = useCallback(async (table: string) => {
        setLoading(true);
        const result = await dbExplorerAction(table);
        setColumns(result.columns);
        setRows(result.rows);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData(selectedTable);
        setSortColumn(null);
        setSearchId("");
    }, [selectedTable, fetchData]);

    const handleRefresh = () => {
        fetchData(selectedTable);
    };

    const handleSort = (col: string) => {
        if (sortColumn === col) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortColumn(col);
            setSortDirection("asc");
        }
    };

    const idColumn = columns.find(c => c.endsWith("_id") || c === "id");

    const filteredAndSortedRows = [...rows]
        .filter(row => {
            if (!searchId || !idColumn) return true;
            return String(row[idColumn] ?? "").toLowerCase().includes(searchId.toLowerCase());
        })
        .sort((a, b) => {
            if (!sortColumn) return 0;
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sortDirection === "asc" ? comparison : -comparison;
        });

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
            return <span className="font-semibold text-ink">{String(value)}</span>;
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

    const SortIcon = ({ col }: { col: string }) => {
        if (sortColumn !== col) return <ArrowUpDown size={12} className="ml-1 opacity-40" />;
        return sortDirection === "asc" ? <ArrowUp size={12} className="ml-1" /> : <ArrowDown size={12} className="ml-1" />;
    };

    return (
        <div className="bg-paper border border-line rounded-r3 overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink">Explorador de Base de Datos</h3>
                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="bg-cream border border-line rounded-xl px-3 py-1.5 text-xs font-mono text-ink focus:border-clay focus:outline-none transition-colors"
                    >
                        {TABLES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    {idColumn && (
                        <div className="relative">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" />
                            <input
                                type="text"
                                placeholder={`Buscar por ${idColumn}...`}
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                className="bg-cream border border-line rounded-xl pl-7 pr-3 py-1.5 text-xs font-mono text-ink placeholder:text-ink-3 focus:border-clay focus:outline-none transition-colors w-48"
                            />
                        </div>
                    )}
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
                ) : filteredAndSortedRows.length === 0 ? (
                    <div className="py-12 text-center text-sm text-ink-3">
                        {rows.length === 0 ? `No hay datos en la tabla ${selectedTable}.` : "No se encontraron resultados."}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead key={col} onClick={() => handleSort(col)} className="cursor-pointer select-none hover:bg-cream/50">
                                        <div className="flex items-center">
                                            {col}
                                            <SortIcon col={col} />
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedRows.map((row, i) => (
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
