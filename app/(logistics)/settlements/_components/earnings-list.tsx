import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import type { SettlementPeriod } from "@/lib/definitions/shipment";

export function EarningsList({ settlements }: { settlements: SettlementPeriod[] }) {
    return (
        <>
            {/* Vista Desktop: Tabla Genérica Especializada */}
            <Card padding="none" className="hidden lgx:block">
                <div className="p-5 border-b border-line">
                    <h3 className="m-0 text-base font-semibold text-ink">Historial de Pagos</h3>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Período</TableHead>
                            <TableHead className="text-center">Viajes</TableHead>
                            <TableHead className="text-right">Total Ganancia</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {settlements.map((s, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-medium text-ink">{s.period}</TableCell>
                                <TableCell className="text-center text-ink-2">{s.trips}</TableCell>
                                <TableCell className="text-right font-bold text-ink">
                                    ${s.amount.toLocaleString("es-AR")}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Vista Mobile: Tarjetas Genéricas Especializadas */}
            <div className="grid gap-3 lgx:hidden">
                {settlements.map((s, i) => (
                    <Card key={i} padding="md">
                        <div className="flex justify-between items-center">
                            <div className="min-w-0">
                                <div className="text-sm font-semibold text-ink">{s.period}</div>
                                <div className="text-xs text-ink-3">{s.trips} viajes realizados</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase font-mono text-ink-3 mb-0.5">Ganancia</div>
                                <div className="text-base font-bold text-ink">
                                    ${s.amount.toLocaleString("es-AR")}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
}