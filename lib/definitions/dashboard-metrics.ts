import { ShipmentSummary } from "./shipments";

export interface DashboardMetrics {
    shipmentToday: number;
    totalEarnings: number;
    totalDistance: number;
}

export interface OperatorDashboardData {
    metrics: DashboardMetrics;
    activeShipments: ShipmentSummary[];
}

export interface WeekData {
    label: string;
    earnings: number;
    trips: number;
}

export interface PerformanceData {
    weeklyEarnings: number;
    weeklyTrips: number;
    avgPerTrip: number;
    earningsChange: number;
    tripsChange: number;
    weeklyHistory: WeekData[];
}