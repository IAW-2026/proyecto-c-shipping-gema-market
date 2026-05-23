import Link from "next/link";
import { Pill } from "@/app/components/ui";
import { ORDER_STATUS_LABEL } from "@/app/lib/constants/orders";
import type { OrdenStatus } from "@prisma/client";

const dateFmt = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const currencyFmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export type OrderRow = {
  id: string;
  buyer: { fullName: string | null; email: string };
  productTitle: string;
  total: number;
  status: OrdenStatus;
  createdAt: Date;
};

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
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
            {rows.map((row) => {
              const { label, tone } = ORDER_STATUS_LABEL[row.status as keyof typeof ORDER_STATUS_LABEL];
              return (
                <tr key={row.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{row.buyer.fullName || "—"}</span>
                    <br />
                    <span className="text-ink-3 text-xs">{row.buyer.email}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-2 [overflow-wrap:anywhere]">
                    {row.productTitle}
                  </td>
                  <td className="px-4 py-3 text-ink hidden sm:table-cell">
                    {currencyFmt.format(row.total)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Pill tone={tone} size="sm">{label}</Pill>
                  </td>
                  <td className="px-4 py-3 text-ink-3 hidden lg:table-cell">
                    {dateFmt.format(row.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${row.id}`}
                      className="text-xs font-medium text-olive hover:text-ink transition-colors"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
