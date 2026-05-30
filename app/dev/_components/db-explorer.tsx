"use client";

import { useState } from "react";
import { RefreshCw, Database } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const TABLES = ["User", "Shipment", "Rate", "TrackingSequence"];

const MOCK_DATA: Record<string, { columns: string[]; rows: Record<string, string | number | boolean | null>[] }> = {
    User: {
        columns: ["id", "clerk_user_id", "email", "full_name", "role", "banned", "created_at"],
        rows: [
            { id: "usr_01KSTW...PM5J", clerk_user_id: "user_3EPi...zW", email: "logisitcsoperator+clerk_test@unihousing.com", full_name: "Logistics Operator", role: "logistics", banned: false, created_at: "2026-05-29 22:05" },
            { id: "usr_01KSTX...N31M", clerk_user_id: "user_3EPu...Bi", email: "logisitcsadmin+clerk_test@unihousing.com", full_name: "Logistics Admin", role: "admin_logistics", banned: false, created_at: "2026-05-29 22:25" },
            { id: "usr_01KSTY...XXXX", clerk_user_id: "user_3EPv...XX", email: "carlos.mendez+clerk_test@unihousing.com", full_name: "Carlos Mendez", role: "logistics", banned: true, created_at: "2026-05-30 14:00" },
            { id: "usr_01KSTZ...YYYY", clerk_user_id: "user_3EPw...YY", email: "ana.torres+clerk_test@unihousing.com", full_name: "Ana Torres", role: "logistics", banned: false, created_at: "2026-05-30 14:00" },
        ],
    },
    Shipment: {
        columns: ["id", "order_id", "tracking_code", "status", "logistics_id", "price", "weight", "created_at"],
        rows: [
            { id: "shp_01K...", order_id: "ord_xxx1", tracking_code: "BB-000001-2026", status: "delivered", logistics_id: "usr_01KSTW...PM5J", price: "4500.00", weight: "12.50", created_at: "2026-05-30 10:15" },
            { id: "shp_01K...", order_id: "ord_xxx2", tracking_code: "BB-000002-2026", status: "in_transit", logistics_id: "usr_01KSTW...PM5J", price: "3200.00", weight: "5.00", created_at: "2026-05-30 11:30" },
            { id: "shp_01K...", order_id: "ord_xxx3", tracking_code: "BB-000003-2026", status: "waiting_for_courier", logistics_id: null, price: "2800.00", weight: "2.30", created_at: "2026-05-30 12:00" },
            { id: "shp_01K...", order_id: "ord_xxx4", tracking_code: "BB-000004-2026", status: "pending_pickup", logistics_id: "usr_01KSTW...PM5J", price: "5100.00", weight: "25.00", created_at: "2026-05-30 13:00" },
            { id: "shp_01K...", order_id: "ord_xxx5", tracking_code: "BB-000005-2026", status: "picked_up", logistics_id: "usr_01KSTW...PM5J", price: "1800.00", weight: "3.50", created_at: "2026-05-30 13:30" },
        ],
    },
    Rate: {
        columns: ["id", "weight_range", "price_per_km"],
        rows: [
            { id: "trf_01J", weight_range: "0 - 30 kg", price_per_km: "0.05" },
            { id: "trf_02J", weight_range: "31 - 100 kg", price_per_km: "0.15" },
            { id: "trf_03J", weight_range: "101 - 250 kg", price_per_km: "0.35" },
            { id: "trf_04J", weight_range: "251 - 600 kg", price_per_km: "0.70" },
            { id: "trf_05J", weight_range: "601 - 99999 kg", price_per_km: "1.50" },
        ],
    },
    TrackingSequence: {
        columns: ["year", "last_number"],
        rows: [
            { year: "2026", last_number: "5" },
        ],
    },
};

function statusColor(status: string): string {
    switch (status) {
        case "delivered": return "text-success";
        case "in_transit": return "text-warning";
        case "picked_up": return "text-warning";
        case "pending_pickup": return "text-ink-2";
        case "waiting_for_courier": return "text-ink-3";
        default: return "text-ink-2";
    }
}

function cellValue(col: string, value: string | number | boolean | null): React.ReactNode {
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
        return <span className={`font-semibold ${statusColor(String(value))}`}>{String(value)}</span>;
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
    return <span className="text-ink-2">{String(value)}</span>;
}

export function DbExplorer() {
    const [selectedTable, setSelectedTable] = useState("User");
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 800);
    };

    const data = MOCK_DATA[selectedTable];

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
                        disabled={refreshing}
                        className="flex items-center gap-1.5 bg-clay text-paper hover:bg-cocoa rounded-xl px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {data.columns.map((col) => (
                                <TableHead key={col}>{col}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.rows.map((row, i) => (
                            <TableRow key={i}>
                                {data.columns.map((col) => (
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
            </div>
        </div>
    );
}
