import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table"
import { ShipmentStatusBadge } from "../../_components/shipment-status-badge"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { ShipmentSummary } from "@/lib/definitions/shipments"

export function HistoryTable({ shipments }: { shipments: ShipmentSummary[] }) {
    return (
        <div className="bg-paper border border-line rounded-r3 overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID envío</TableHead>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Pago</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {shipments.map((s) => (
                        <TableRow key={s.shippingId}>
                            <TableCell className="text-ink-3 font-mono font-medium">{s.shippingId}</TableCell>
                            <TableCell className="font-mono text-ink-3">{s.orderId}</TableCell>

                            {/* Corrección 1: Acceder al objeto deliveryAddress */}
                            <TableCell className="text-ink-2 truncate max-w-[200px]">
                                {s.deliveryAddress.street} {s.deliveryAddress.number}
                                {s.deliveryAddress.floor ? `, ${s.deliveryAddress.floor}°${s.deliveryAddress.apartment || ''}` : ''}
                            </TableCell>

                            <TableCell>
                                <ShipmentStatusBadge status={s.status} />
                            </TableCell>
                            <TableCell className="text-right font-bold text-ink">
                                ${s.price.toLocaleString('es-AR')}
                            </TableCell>
                            <TableCell className="text-right">
                                {/* Corrección 2: Usar s.shippingId en lugar de s.id */}
                                <Link href={`/shipments/${s.shippingId}`} className="group">
                                    <ChevronRight size={18} className="text-ink-3 group-hover:text-clay inline transition-colors" />
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}