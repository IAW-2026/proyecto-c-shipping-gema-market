import { MetricCard } from "./metric-card";
import { DashboardMetrics } from "@/lib/definitions/dashboard-metrics"

export function MetricsGrid({ metrics }: { metrics: DashboardMetrics }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
            <MetricCard
                title="Entregados hoy"
                value={metrics.shipmentToday}
            />
            <MetricCard
                title="Ganancia hoy"
                value={`$ ${metrics.totalEarnings.toLocaleString('es-AR')}`}
            />
            <MetricCard
                title="Distancia total"
                value={`${metrics.totalDistance} km`}
            />
        </div>
    );
}