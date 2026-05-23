import { Skeleton } from "@/app/components/ui";

export function OrdersTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="bg-paper border border-line rounded-r3 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bone/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-ink-2">Usuario</th>
              <th className="px-4 py-3 font-medium text-ink-2">Producto</th>
              <th className="px-4 py-3 font-medium text-ink-2 hidden sm:table-cell">Total</th>
              <th className="px-4 py-3 font-medium text-ink-2 hidden md:table-cell">Estado</th>
              <th className="px-4 py-3 font-medium text-ink-2 hidden lg:table-cell">Fecha</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-4 py-3 space-y-1.5">
                  <Skeleton w="55%" h={14} r={6} />
                  <Skeleton w="70%" h={11} r={4} />
                </td>
                <td className="px-4 py-3">
                  <Skeleton w="75%" h={14} r={6} />
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <Skeleton w={80} h={14} r={6} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <Skeleton w={90} h={22} r={20} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <Skeleton w={70} h={14} r={6} />
                </td>
                <td className="px-4 py-3">
                  <Skeleton w={36} h={28} r={6} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
