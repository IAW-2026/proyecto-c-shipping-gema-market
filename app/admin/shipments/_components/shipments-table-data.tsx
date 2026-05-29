import { requireRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/types/auth";
import { getAllShipments } from "@/lib/db/queries/admin/shipments";
import { formatDate } from "@/lib/utils/date-utils";
import { updateShipmentPriceAction } from "@/lib/features/admin/actions";
import { DeleteShipmentButton } from "./delete-shipment-button";
import { UnassignShipmentButton } from "./unassign-shipment-button";
import { SortableHeader } from "./sortable-header";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { AdminShipmentStatusBadge } from "../../_components/admin-shipment-status-badge";
import { Edit3 } from "lucide-react";

interface AdminShipmentsTableDataProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function AdminShipmentsTableData({ searchParams }: AdminShipmentsTableDataProps) {
    await requireRole([ROLES.ADMIN_LOGISTICS]);
    const raw = await searchParams;
    const page = parseInt(raw.page || "1", 10) || 1;
    const result = await getAllShipments(raw.status, raw.sortBy, raw.sortOrder, page);

    return (
        <div className="bg-paper border border-line rounded-r2 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><SortableHeader label="Tracking" sortKey="tracking_code" /></TableHead>
                        <TableHead><SortableHeader label="Estado" sortKey="status" /></TableHead>
                        <TableHead><SortableHeader label="Precio" sortKey="price" /></TableHead>
                        <TableHead><SortableHeader label="Repartidor" sortKey="logistics_id" /></TableHead>
                        <TableHead><SortableHeader label="Fecha" sortKey="created_at" /></TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-ink-2">
                                No hay envíos registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        result.data.map((s) => (
                            <TableRow key={s.id}>
                                <TableCell className="text-ink-3 font-mono text-xs">
                                    {s.tracking_code}
                                </TableCell>
                                <TableCell>
                                    <AdminShipmentStatusBadge status={s.status} />
                                </TableCell>
                                <TableCell>
                                    {s.status === "waiting_for_courier" ? (
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
                                    ) : (
                                        <span className="text-ink-2 text-xs">$ {s.price.toLocaleString()}</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-ink-2 text-xs">
                                    {s.logistics_name ?? <span className="italic">Sin asignar</span>}
                                </TableCell>
                                <TableCell className="text-ink-2 whitespace-nowrap text-xs">
                                    {formatDate(s.created_at, { day: "2-digit", month: "2-digit", year: "numeric" })}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {s.logistics_id && s.status === "pending_pickup" && (
                                            <UnassignShipmentButton id={s.id} tracking={s.tracking_code} />
                                        )}
                                        <DeleteShipmentButton id={s.id} tracking={s.tracking_code} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <Pagination currentPage={result.page} totalPages={result.totalPages} />
        </div>
    );
}
