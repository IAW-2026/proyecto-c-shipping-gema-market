import { notFound } from "next/navigation";
import { ROLES } from "@/lib/definitions/auth";
import { requireRole } from "@/lib/auth/rbac";
import { getDriverById } from "@/lib/db/queries/dashboard";
import { PageWrapper, Header, Content } from "../../_components";
import { Package, CheckCircle, Clock } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
    waiting_for_courier: "Esperando repartidor",
    pending_pickup: "Pendiente de retiro",
    picked_up: "Retirado",
    in_transit: "En viaje",
    delivered: "Entregado",
};

const STATUS_COLORS: Record<string, string> = {
    waiting_for_courier: "bg-gray-100 text-gray-600",
    pending_pickup: "bg-amber-100 text-amber-700",
    picked_up: "bg-blue-100 text-blue-700",
    in_transit: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
};

export default async function DriverDetailPage(props: { params: Promise<{ driverId: string }> }) {
    await requireRole([ROLES.ADMIN_LOGISTICS]);
    const { driverId } = await props.params;
    const driver = await getDriverById(driverId);

    if (!driver) notFound();

    const total = driver.envios.length;
    const delivered = driver.envios.filter((e) => e.status === "delivered").length;
    const active = driver.envios.filter((e) =>
        ["pending_pickup", "picked_up", "in_transit"].includes(e.status)
    ).length;

    return (
        <PageWrapper>
            <Header
                title={driver.full_name}
                subtitle={`${driver.email} · Registrado el ${driver.created_at.toLocaleDateString("es-AR")}${driver.banned ? " · BANEADO" : ""}`}
            />
            <Content className="p-4 lgx:p-7">
                {driver.banned && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-r2 px-4 py-3 mb-6">
                        Este repartidor está baneado. No puede tomar nuevos envíos.
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    <div className="bg-paper border border-line rounded-r2 p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <Package size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-3">{total}</div>
                            <div className="text-xs text-ink-2">Total envíos</div>
                        </div>
                    </div>
                    <div className="bg-paper border border-line rounded-r2 p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-3">{delivered}</div>
                            <div className="text-xs text-ink-2">Entregados</div>
                        </div>
                    </div>
                    <div className="bg-paper border border-line rounded-r2 p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-ink-3">{active}</div>
                            <div className="text-xs text-ink-2">Activos</div>
                        </div>
                    </div>
                </div>

                <div className="bg-paper border border-line rounded-r2 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-bone text-ink-2 text-left">
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Shipping ID</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Estado</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Precio</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {driver.envios.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-ink-2">
                                            Este repartidor no tiene envíos registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    driver.envios.map((e) => (
                                        <tr key={e.id} className="border-t border-line hover:bg-bone/30">
                                            <td className="px-4 py-3 text-ink-3 font-mono text-xs">
                                                {e.id}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[e.status] ?? "bg-gray-100 text-gray-600"}`}>
                                                    {STATUS_LABELS[e.status] ?? e.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-ink-3">${e.price.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-ink-2 whitespace-nowrap text-xs">
                                                {e.created_at.toLocaleDateString("es-AR")}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Content>
        </PageWrapper>
    );
}
