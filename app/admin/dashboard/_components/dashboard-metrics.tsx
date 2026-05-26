import { getAdminDashboardMetrics } from "@/lib/db/queries/dashboard";
import { Truck, Package, TrendingUp, ClipboardList, DollarSign } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
    waiting_for_courier: "Esperando repartidor",
    pending_pickup: "Pendiente de retiro",
    picked_up: "Retirado",
    in_transit: "En viaje",
    delivered: "Entregado",
};

export async function AdminDashboardMetrics() {
    const metrics = await getAdminDashboardMetrics();

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-paper border border-line rounded-r2 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Truck size={20} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-ink-3">{metrics.totalDrivers}</div>
                        <div className="text-xs text-ink-2">Repartidores</div>
                    </div>
                </div>
                <div className="bg-paper border border-line rounded-r2 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                        <Package size={20} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-ink-3">{metrics.totalShipments}</div>
                        <div className="text-xs text-ink-2">Total envíos</div>
                    </div>
                </div>
                <div className="bg-paper border border-line rounded-r2 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-ink-3">{metrics.activeShipments}</div>
                        <div className="text-xs text-ink-2">Envíos activos</div>
                    </div>
                </div>
                <div className="bg-paper border border-line rounded-r2 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <ClipboardList size={20} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-ink-3">{metrics.shipmentsToday}</div>
                        <div className="text-xs text-ink-2">Envíos hoy</div>
                    </div>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-paper border border-line rounded-r2 p-5">
                    <h2 className="text-sm font-semibold text-ink-3 mb-3 flex items-center gap-2">
                        <DollarSign size={16} /> Tarifas configuradas
                    </h2>
                    <div className="text-2xl font-bold text-ink-3">{metrics.totalRates}</div>
                    <p className="text-xs text-ink-2 mt-1">Rangos de peso con precio por km</p>
                </div>
                <div className="bg-paper border border-line rounded-r2 p-5 lg:col-span-2">
                    <h2 className="text-sm font-semibold text-ink-3 mb-3">Envíos por estado</h2>
                    <div className="space-y-2">
                        {Object.entries(STATUS_LABELS).map(([status, label]) => {
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
                </div>
            </div>
        </>
    );
}
