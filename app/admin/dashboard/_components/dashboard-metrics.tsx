import { getAdminDashboardMetrics } from "@/lib/db/queries/admin/dashboard";
import { Truck, Package, TrendingUp, ClipboardList, DollarSign } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { Card } from "@/components/ui/card";
import { ADMIN_SHIPMENT_STATUS_LABELS } from "@/lib/shared/shipment-constants";

export async function AdminDashboardMetrics() {
    const metrics = await getAdminDashboardMetrics();

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <MetricCard
                    title="Repartidores"
                    value={metrics.totalDrivers}
                    icon={
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <Truck size={20} />
                        </div>
                    }
                />
                <MetricCard
                    title="Total envíos"
                    value={metrics.totalShipments}
                    icon={
                        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                            <Package size={20} />
                        </div>
                    }
                />
                <MetricCard
                    title="Envíos activos"
                    value={metrics.activeShipments}
                    icon={
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <TrendingUp size={20} />
                        </div>
                    }
                />
                <MetricCard
                    title="Envíos hoy"
                    value={metrics.shipmentsToday}
                    icon={
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                            <ClipboardList size={20} />
                        </div>
                    }
                />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                    title="Tarifas configuradas"
                    value={metrics.totalRates}
                    icon={
                        <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                            <DollarSign size={20} />
                        </div>
                    }
                />
                <Card className="lg:col-span-2">
                    <h2 className="text-sm font-semibold text-ink-3 mb-3">Envíos por estado</h2>
                    <div className="space-y-2">
                        {Object.entries(ADMIN_SHIPMENT_STATUS_LABELS).map(([status, label]) => {
                            const count = metrics.shipmentsByStatus[status] ?? 0;
                            const total = metrics.totalShipments || 1;
                            const pct = Math.round((count / total) * 100);
                            return (
                                <div key={status}>
                                    <div className="flex justify-between text-xs text-ink-2 mb-1">
                                        <span>{label}</span>
                                        <span className="font-medium text-ink-3">{count}</span>
                                    </div>
                                    <div className="w-full h-2 bg-bone rounded-full overflow-hidden">
                                        <div className="h-full bg-cocoa rounded-full transition-all" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </>
    );
}
