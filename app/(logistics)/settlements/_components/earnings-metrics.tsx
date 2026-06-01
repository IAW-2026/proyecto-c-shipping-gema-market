import { MetricCard } from "@/components/ui/metric-card";

interface EarningsMetricsProps {
    metrics: {
        periodTotal: number;
        periodTrips: number;
        averagePerTrip: number;
    };
}

export function EarningsMetrics({ metrics }: EarningsMetricsProps) {
    return (
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-3">
            <MetricCard
                title="Últimas 6 semanas"
                value={`$${metrics.periodTotal.toLocaleString("es-AR")}`}
            />

            <MetricCard
                title="Viajes (6 semanas)"
                value={metrics.periodTrips}
            />

            <MetricCard
                title="Promedio / viaje"
                value={`$${metrics.averagePerTrip.toLocaleString("es-AR")}`}
            />
        </div>
    );
}