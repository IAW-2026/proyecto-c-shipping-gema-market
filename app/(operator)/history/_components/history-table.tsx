import {
    Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from "@/components/ui/table"
import { ShipmentStatusBadge } from "../../_components/shipment-status-badge"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface ShipmentHistoryItem {
    id: string
    order: string
    to: string
    status: any
    price: number
}

export function HistoryTable({ shipments }: { shipments: ShipmentHistoryItem[] }) {
    return (
        <div className="bg-paper border border-line rounded-r3 overflow-hidden shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tracking</TableHead>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Pago</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {shipments.map((s) => (
                        <TableRow key={s.id}>
                            <TableCell className="text-ink font-mono font-medium">{s.id}</TableCell>
                            <TableCell className="font-mono text-ink-3">{s.order}</TableCell>
                            <TableCell className="text-ink-2 truncate max-w-[200px]">{s.to}</TableCell>
                            <TableCell>
                                <ShipmentStatusBadge status={s.status} />
                            </TableCell>
                            <TableCell className="text-right font-bold text-ink">
                                ${s.price.toLocaleString('es-AR')}
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/shipment/${s.id}`}>
                                    <ChevronRight size={18} className="text-ink-3 group-hover:text-clay inline" />
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}