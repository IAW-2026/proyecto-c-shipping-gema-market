import { Skeleton } from "@/app/components/ui";

interface Props {
  rows?: number;
}

export function UsuariosTableSkeleton({ rows = 8 }: Props) {
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
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-4 py-3">
                  <Skeleton w="60%" h={14} r={6} />
                </td>
                <td className="px-4 py-3">
                  <Skeleton w="80%" h={14} r={6} />
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <Skeleton w="50%" h={14} r={6} />
                </td>
                <td className="px-4 py-3 hidden lgx:table-cell">
                  <Skeleton w={70} h={14} r={6} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Skeleton w={28} h={14} r={6} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
