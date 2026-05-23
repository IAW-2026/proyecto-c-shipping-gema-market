import Link from "next/link";
import type { Usuario } from "@prisma/client";

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function UsuariosTable({ usuarios }: { usuarios: Usuario[] }) {
  return (
    <div className="bg-paper border border-line rounded-r3 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bone/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-ink-2">Nombre</th>
              <th className="px-4 py-3 font-medium text-ink-2">Email</th>
              <th className="px-4 py-3 font-medium text-ink-2 hidden sm:table-cell">
                Teléfono
              </th>
              <th className="px-4 py-3 font-medium text-ink-2 hidden lgx:table-cell">
                Alta
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium text-ink">{u.fullName || "—"}</td>
                <td className="px-4 py-3 text-ink-2 [overflow-wrap:anywhere]">
                  {u.email}
                </td>
                <td className="px-4 py-3 text-ink-2 hidden sm:table-cell">
                  {u.phoneNumber || "—"}
                </td>
                <td className="px-4 py-3 text-ink-3 hidden lgx:table-cell">
                  {dateFmt.format(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="text-[13px] font-semibold text-olive hover:underline"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
