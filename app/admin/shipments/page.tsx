import { ROLES } from "@/lib/definitions/auth";
import { requireRole } from "@/lib/auth/rbac";
import { getAllShipments } from "@/lib/db/queries/dashboard";
import { updateShipmentPriceAction } from "@/lib/actions/admin.actions";
import { PageWrapper, Header, Content } from "../_components";
import { DeleteShipmentButton } from "./_components/delete-shipment-button";
import { UnassignShipmentButton } from "./_components/unassign-shipment-button";
import { Edit3 } from "lucide-react";

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

export default async function AdminShipmentsPage() {
    await requireRole([ROLES.ADMIN_LOGISTICS]);
    const shipments = await getAllShipments();

    return (
        <PageWrapper>
            <Header title="Pedidos" subtitle="Gestión" />
            <Content className="p-4 lgx:p-7">
                <div className="bg-paper border border-line rounded-r2 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-bone text-ink-2 text-left">
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Tracking</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Estado</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Precio</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Repartidor</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Fecha</th>
                                    <th className="px-4 py-3 font-medium whitespace-nowrap text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shipments.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-ink-2">
                                            No hay envíos registrados.
                                        </td>
                                    </tr>
                                ) : (
                                    shipments.map((s) => {
                                        return (
                                            <tr key={s.id} className="border-t border-line hover:bg-bone/30">
                                                <td className="px-4 py-3 text-ink-3 font-mono text-xs">
                                                    {s.tracking_code}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {STATUS_LABELS[s.status] ?? s.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <form action={async (formData: FormData) => {
                                                        "use server";
                                                        const price = Number(formData.get("price"));
                                                        await updateShipmentPriceAction(s.id, price);
                                                    }} className="flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            name="price"
                                                            defaultValue={s.price}
                                                            step="0.01"
                                                            min="0"
                                                            className="w-24 text-xs px-2 py-1 border border-line rounded-lg bg-transparent text-ink-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="text-cocoa hover:text-cocoa/70 p-1"
                                                            title="Guardar precio"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                    </form>
                                                </td>
                                                <td className="px-4 py-3 text-ink-2 text-xs">
                                                    {s.logistics_name ?? <span className="italic">Sin asignar</span>}
                                                </td>
                                                <td className="px-4 py-3 text-ink-2 whitespace-nowrap text-xs">
                                                    {s.created_at.toLocaleDateString("es-AR")}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {s.logistics_id && s.status === "pending_pickup" && (
                                                            <UnassignShipmentButton id={s.id} tracking={s.tracking_code} />
                                                        )}
                                                        <DeleteShipmentButton id={s.id} tracking={s.tracking_code} />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Content>
        </PageWrapper>
    );
}
