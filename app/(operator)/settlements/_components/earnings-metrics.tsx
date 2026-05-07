import { MetricCard } from "@/components/ui/metric-card";

interface EarningsMetricsProps {
    metrics: {
        monthTotal: number;
        monthTrips: number;
        averagePerTrip: number;
    };
}

export function EarningsMetrics({ metrics }: EarningsMetricsProps) {
    return (
        <div className="grid gap-4 mb-6 grid-cols-1 sm:grid-cols-3">
            <MetricCard
                title="Este mes"
                value={`$${metrics.monthTotal.toLocaleString("es-AR")}`}
            />

            <MetricCard
                title="Viajes del mes"
                value={metrics.monthTrips}
            />

            <MetricCard
                title="Promedio / viaje"
                value={`$${metrics.averagePerTrip.toLocaleString("es-AR")}`}
            />
        </div>
    );
}