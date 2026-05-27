import { notFound } from "next/navigation";
import { getDriverById } from "@/lib/db/queries/dashboard";
import { formatDate } from "@/lib/shared/date-utils";
import { Package, CheckCircle, Clock } from "lucide-react";
import { Header, Content, PageWrapper } from "../../../_components";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { MetricCard } from "@/components/ui/metric-card";
import { AdminShipmentStatusBadge } from "../../../_components/admin-shipment-status-badge";

export async function DriverDetailData({ params }: { params: Promise<{ driverId: string }> }) {
    const { driverId } = await params;
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
                subtitle={`${driver.email} · Registrado el ${formatDate(driver.created_at, { day: "2-digit", month: "2-digit", year: "numeric" })}${driver.banned ? " · BANEADO" : ""}`}
            />
            <Content className="p-4 lgx:p-7">
                {driver.banned && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-r2 px-4 py-3 mb-6">
                        Este repartidor está baneado. No puede tomar nuevos envíos.
                    </div>
                )}
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    <MetricCard
                        title="Total envíos"
                        value={total}
                        icon={
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                <Package size={20} />
                            </div>
                        }
                    />
                    <MetricCard
                        title="Entregados"
                        value={delivered}
                        icon={
                            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                                <CheckCircle size={20} />
                            </div>
                        }
                    />
                    <MetricCard
                        title="Activos"
                        value={active}
                        icon={
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                                <Clock size={20} />
                            </div>
                        }
                    />
                </div>
                <div className="bg-paper border border-line rounded-r2 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shipping ID</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {driver.envios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-ink-2">
                                        Este repartidor no tiene envíos registrados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                driver.envios.map((e) => (
                                    <TableRow key={e.id}>
                                        <TableCell className="text-ink-3 font-mono text-xs">{e.id}</TableCell>
                                        <TableCell>
                                            <AdminShipmentStatusBadge status={e.status} />
                                        </TableCell>
                                        <TableCell className="text-ink-3">${e.price.toFixed(2)}</TableCell>
                                        <TableCell className="text-ink-2 whitespace-nowrap text-xs">
                                            {formatDate(e.created_at, { day: "2-digit", month: "2-digit", year: "numeric" })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Content>
        </PageWrapper>
    );
}
