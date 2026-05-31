"use server";

import { getUsers, getShipments, getRates, getTrackingSequence } from "@/lib/db/queries/dev/db-explorer";

const TABLE_CONFIG: Record<string, { columns: string[]; fetch: () => Promise<Record<string, unknown>[]> }> = {
    User: {
        columns: ["id", "clerk_user_id", "email", "full_name", "role", "banned", "created_at"],
        fetch: getUsers,
    },
    Shipment: {
        columns: ["id", "order_id", "tracking_code", "status", "logistics_id", "price", "weight", "created_at", "delivered_at"],
        fetch: getShipments,
    },
    Rate: {
        columns: ["id", "weight_range", "price_per_km"],
        fetch: getRates,
    },
    TrackingSequence: {
        columns: ["year", "last_number"],
        fetch: getTrackingSequence,
    },
};

export async function dbExplorerAction(tableName: string) {
    const config = TABLE_CONFIG[tableName];
    if (!config) {
        return { columns: [], rows: [] };
    }

    try {
        const rows = await config.fetch();
        return { columns: config.columns, rows };
    } catch {
        return { columns: config.columns, rows: [] };
    }
}
