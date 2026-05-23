import Image from "next/image";
import { SectionTitle, Card, Icon } from "@/app/components/ui";
import { fmtARS } from "@/app/lib/utils/format";
import type { CheckoutItem } from "@/app/lib/types/orders";
import type { Address } from "@/app/lib/types/user";

interface CheckoutSummaryStepProps {
  addr: Address;
  items: CheckoutItem[];
  subtotal: number;
  totalShipping: number;
  total: number;
}

export function CheckoutSummaryStep({
  addr,
  items,
  subtotal,
  totalShipping,
  total,
}: CheckoutSummaryStepProps) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <SectionTitle eyebrow="Paso 2">Resumen y pago</SectionTitle>

      {/* Dirección confirmada */}
      <Card padding={16} className="mb-3">
        <div className="flex gap-2.5 items-start">
          <div className="w-8 h-8 rounded-lg bg-bone text-olive flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="pin" size={15} />
          </div>
          <div>
            <div className="text-[11px] font-mono text-ink-3 mb-0.5 uppercase tracking-wide">
              Entregamos en
            </div>
            <div className="font-medium text-sm">
              {addr.street} {addr.number}
            </div>
            <div className="text-[13px] text-ink-3"> CP {addr.zip}</div>
          </div>
        </div>
      </Card>

      {/* Productos con envío individual */}
      <Card padding={0} className="mb-3 overflow-hidden">
        {items.map((item, idx) => (
          <div
            key={item.itemId}
            className={`px-4 py-3.5 flex gap-3 ${idx > 0 ? "border-t border-line" : ""}`}
          >
            {/* Imagen del producto */}
            <div className="w-14 h-14 rounded-lg bg-bone shrink-0 overflow-hidden">
              {item.productImage ? (
                <Image
                  src={item.productImage}
                  alt={item.productTitle}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-ink-3" aria-hidden="true">
                  <Icon name="image" size={20} />
                </div>
              )}
            </div>

            {/* Datos del item */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-sm leading-tight truncate">
                    {item.productTitle}
                  </div>
                  <div className="text-[12px] text-ink-3 mt-0.5">
                    {item.quantity > 1 && `×${item.quantity} · `}
                    {fmtARS(item.unitPrice)}
                    {item.quantity > 1 ? " c/u" : ""}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-sm">
                    {fmtARS(item.unitPrice * item.quantity)}
                  </div>
                </div>
              </div>

              {/* Envío por producto */}
              <div className="flex items-center gap-1.5 mt-2 text-[12px] text-ink-3">
                <Icon name="truck" size={13} />
                <span>
                  Envío estimado: {item.quote.estimated_days}{" "}
                  {item.quote.estimated_days === 1 ? "día" : "días"} ·{" "}
                  <span className="font-medium text-ink">
                    {fmtARS(item.quote.price)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Totales */}
      <Card padding={16} className="mb-3">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-ink-3">Subtotal productos</span>
          <span>{fmtARS(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-ink-3">Costo de envío</span>
          <span>{fmtARS(totalShipping)}</span>
        </div>
        <div className="h-px bg-line my-2.5" />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{fmtARS(total)}</span>
        </div>
      </Card>

      {/* Badge de seguridad */}
      <Card
        padding={14}
        className="flex gap-2.5 items-center text-[13px] text-ink-3"
      >
        <Icon name="shield" size={18} className="text-success shrink-0" />
        Tus datos están protegidos. Pago procesado por Mercado Pago.
      </Card>
    </div>
  );
}
