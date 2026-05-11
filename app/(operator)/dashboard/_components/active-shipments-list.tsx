import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { ShipmentSummary } from "@/lib/definitions/shipment";
import { ShipmentStatusBadge } from "../../_components/shipment-status-badge";
interface ActiveShipmentsListProps {
  shipments: ShipmentSummary[];
}

export function ActiveShipmentsList({ shipments }: ActiveShipmentsListProps) {
  return (
    <section className="bg-paper border border-line rounded-r3 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-line flex justify-between items-center bg-cream/30">
        <h3 className="m-0 text-base font-semibold text-ink">Mis envíos activos</h3>
        <Link
          href="/history"
          className="text-sm font-medium text-ink flex items-center gap-1 hover:underline transition-all"
        >
          Ver historial <ArrowRight size={16} />
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-line">
        {shipments.length === 0 ? (
          <div className="p-8 text-center text-ink-3 font-medium">
            No tienes envíos activos en este momento.
          </div>
        ) : (
          shipments.map((s) => (
            <Link
              key={s.shippingId}
              href={`/shipments/${s.shippingId}`}
              className="p-4 hover:bg-cream/50 transition-colors flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-bone flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package size={22} className="text-cocoa" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-ink">{s.shippingId}</span>
                  <ShipmentStatusBadge status={s.status} />
                </div>
                <div className="text-sm text-ink-2 truncate">
                  {s.deliveryAddress.street} {s.deliveryAddress.number}
                </div>
              </div>
              <div className="text-right pl-4">
                <div className="font-semibold text-ink">${s.price}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}