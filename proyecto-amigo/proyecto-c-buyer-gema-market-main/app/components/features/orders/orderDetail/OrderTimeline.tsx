import { Card, Icon } from "@/app/components/ui";
import type { OrderStatus } from "@/app/lib/types/orders";
import type { IconName } from "@/app/components/ui";

const TIMELINE: { status: OrderStatus; label: string; icon: IconName }[] = [
  { status: "awaiting_payment", label: "Pago pendiente", icon: "creditCard" },
  { status: "paid", label: "Pago confirmado", icon: "check" },
  { status: "shipping", label: "En camino", icon: "truck" },
  { status: "delivered", label: "Entregado", icon: "home" },
];

const ORDER_SEQUENCE: OrderStatus[] = [
  "created",
  "awaiting_payment",
  "paid",
  "shipping",
  "delivered",
];

const FAILED_STATUSES: OrderStatus[] = ["cancelled", "shipping_failed"];

interface OrderTimelineProps {
  status: OrderStatus;
  paymentId?: string;
  shippingId?: string;
}

export function OrderTimeline({ status, paymentId, shippingId }: OrderTimelineProps) {
  if (FAILED_STATUSES.includes(status)) return null;

  const currentIdx = ORDER_SEQUENCE.indexOf(status);

  return (
    <Card padding={20} className="mb-4">
      <h3 className="m-0 mb-4 text-sm font-semibold">Seguimiento</h3>

      <div className="flex flex-col relative">
        {TIMELINE.map((step, i) => {
          const timelineIdx = ORDER_SEQUENCE.indexOf(step.status);
          const done = timelineIdx <= currentIdx;
          const active = timelineIdx === currentIdx;

          return (
            <div
              key={step.status}
              className={`flex gap-3.5 relative ${i < TIMELINE.length - 1 ? "pb-4" : ""}`}
            >
              {i < TIMELINE.length - 1 && (
                <div
                  className={`absolute top-7 left-[13px] bottom-0 w-0.5 transition-colors ${
                    timelineIdx < currentIdx ? "bg-forest" : "bg-line-2"
                  }`}
                />
              )}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 relative z-[1] transition-all duration-300 ${
                  done ? "bg-forest text-paper" : "bg-bone text-ink-3"
                }`}
                style={active ? { boxShadow: "0 0 0 4px rgba(101,109,74,.2)" } : undefined}
              >
                <Icon name={done ? "check" : step.icon} size={14} />
              </div>
              <div className="pt-1">
                <div
                  className={`text-sm ${active ? "font-semibold" : "font-medium"} ${done ? "text-ink" : "text-ink-3"}`}
                >
                  {step.label}
                </div>
                {active && (
                  <div className="text-xs text-ink-3 mt-0.5">En proceso</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(paymentId || shippingId) && (
        <div className="mt-4 pt-3 border-t border-line space-y-1">
          {paymentId && (
            <div className="text-xs text-ink-3">
              Pago: <span className="font-mono">{paymentId}</span>
            </div>
          )}
          {shippingId && (
            <div className="text-xs text-ink-3">
              Envío: <span className="font-mono">{shippingId}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
