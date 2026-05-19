import { ShipmentSummary } from "./shipment";

export interface DashboardMetrics {
    shipmentToday: number;
    totalEarnings: number;
    totalDistance: number;
}

export interface OperatorDashboardData {
    metrics: DashboardMetrics;
    activeShipments: ShipmentSummary[];
}