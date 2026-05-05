import { Card } from "@/components/ui/card";

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
            <Card padding="lg">
                <div className="text-xs text-ink-3">Este mes</div>
                <div className="text-[26px] font-bold text-ink">
                    ${metrics.monthTotal.toLocaleString("es-AR")}
                </div>
            </Card>

            <Card padding="lg">
                <div className="text-xs text-ink-3">Viajes del mes</div>
                <div className="text-[26px] font-bold text-ink">
                    {metrics.monthTrips}
                </div>
            </Card>

            <Card padding="lg">
                <div className="text-xs text-ink-3">Promedio / viaje</div>
                <div className="text-[26px] font-bold text-ink">
                    ${metrics.averagePerTrip.toLocaleString("es-AR")}
                </div>
            </Card>
        </div>
    );
}