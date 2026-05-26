import Link from "next/link";
import { getAllDrivers } from "@/lib/db/queries/dashboard";
import { ToggleBanButton } from "./toggle-ban-button";
import { DeleteDriverButton } from "./delete-driver-button";

export async function AdminDriversTableData({
    search,
    banned,
}: {
    search?: string;
    banned?: "all" | "banned" | "active";
}) {
    const drivers = await getAllDrivers(search, banned);

    return (
        <div className="bg-paper border border-line rounded-r2 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-bone text-ink-2 text-left">
                        <th className="px-4 py-3 font-medium">Nombre</th>
                        <th className="px-4 py-3 font-medium">Email</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Envíos</th>
                        <th className="px-4 py-3 font-medium">Registrado</th>
                        <th className="px-4 py-3 font-medium text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {drivers.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-ink-2">
                                No hay repartidores registrados.
                            </td>
                        </tr>
                    ) : (
                        drivers.map((d) => (
                            <tr key={d.id} className="border-t border-line hover:bg-bone/30">
                                <td className="px-4 py-3">
                                    <Link href={`/admin/drivers/${d.id}`} className="text-cocoa hover:underline font-medium">
                                        {d.full_name}
                                    </Link>
                                </td>
                                <td className="px-4 py-3 text-ink-2">{d.email}</td>
                                <td className="px-4 py-3">
                                    {d.banned ? (
                                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Baneado</span>
                                    ) : (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Activo</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-ink-3">{d.totalEnvios}</td>
                                <td className="px-4 py-3 text-ink-2">
                                    {d.created_at.toLocaleDateString("es-AR")}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <ToggleBanButton id={d.id} banned={d.banned} fullName={d.full_name} />
                                        <span className="text-line select-none text-xs">|</span>
                                        <DeleteDriverButton id={d.id} fullName={d.full_name} />
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
