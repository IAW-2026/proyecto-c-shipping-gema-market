import Link from "next/link";
import { getAllDrivers } from "@/lib/db/queries/admin/drivers";
import { formatDate } from "@/lib/shared/date-utils";
import { ToggleBanButton } from "./toggle-ban-button";
import { DeleteDriverButton } from "./delete-driver-button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";

interface AdminDriversTableDataProps {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function AdminDriversTableData({ searchParams }: AdminDriversTableDataProps) {
    const raw = await searchParams;
    const page = parseInt(raw.page || "1", 10) || 1;
    const result = await getAllDrivers(raw.search, raw.banned as "all" | "banned" | "active" | undefined, page);

    return (
        <div className="bg-paper border border-line rounded-r2 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Envíos</TableHead>
                        <TableHead>Registrado</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-ink-2">
                                No hay repartidores registrados.
                            </TableCell>
                        </TableRow>
                    ) : (
                        result.data.map((d) => (
                            <TableRow key={d.id}>
                                <TableCell>
                                    <Link href={`/admin/drivers/${d.id}`} className="text-cocoa hover:underline font-medium">
                                        {d.full_name}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-ink-2">{d.email}</TableCell>
                                <TableCell>
                                    {d.banned ? (
                                        <Badge variant="warning">Baneado</Badge>
                                    ) : (
                                        <Badge variant="success">Activo</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-ink-3">{d.totalShipments}</TableCell>
                                <TableCell className="text-ink-2">
                                    {formatDate(d.created_at, { day: "2-digit", month: "2-digit", year: "numeric" })}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <ToggleBanButton id={d.id} banned={d.banned} fullName={d.full_name} />
                                        <span className="text-line select-none text-xs">|</span>
                                        <DeleteDriverButton id={d.id} fullName={d.full_name} />
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
