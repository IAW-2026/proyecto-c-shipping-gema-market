export interface AdminDashboardMetrics {
    totalDrivers: number;
    totalShipments: number;
    shipmentsByStatus: Record<string, number>;
    shipmentsToday: number;
    totalRates: number;
    activeShipments: number;
}

export interface AdminDriver {
    id: string;
    full_name: string;
    email: string;
    role: string;
    banned: boolean;
    created_at: Date;
    totalEnvios: number;
}

export interface AdminShipment {
    id: string;
    order_id: string;
    tracking_code: string;
    status: string;
    price: number;
    logistics_id: string | null;
    logistics_name: string | null;
    created_at: Date;
}

export interface AdminRate {
    id: string;
    weight_min: number;
    weight_max: number;
    price_per_km: number;
}

export interface DriverEnvio {
    id: string;
    order_id: string;
    tracking_code: string;
    status: string;
    price: number;
    created_at: Date;
}

export interface AdminDriverDetail {
    id: string;
    full_name: string;
    email: string;
    role: string;
    banned: boolean;
    created_at: Date;
    envios: DriverEnvio[];
}
