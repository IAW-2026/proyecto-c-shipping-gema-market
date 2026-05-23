import Image from "next/image";
import { Card, Icon, Pill } from "@/app/components/ui";
import { fmtARS } from "@/app/lib/utils/format";
import { ORDER_STATUS_LABEL } from "@/app/lib/constants/orders";
import type { OrderDetailForUI } from "@/app/lib/types/orders";

type Props = Pick<
  OrderDetailForUI,
  | "status"
  | "productTitle"
  | "productThumbnail"
  | "quantity"
  | "unitPrice"
  | "shippingPrice"
  | "total"
>;

export function OrderProductCard({
  status,
  productTitle,
  productThumbnail,
  quantity,
  unitPrice,
  shippingPrice,
  total,
}: Props) {
  const st = ORDER_STATUS_LABEL[status];

  return (
    <Card padding={16} className="mb-4">
      <h3 className="m-0 mb-3 text-sm font-semibold">Producto</h3>

      <div className="flex gap-3 items-start">
        {productThumbnail ? (
          <Image
            src={productThumbnail}
            alt={productTitle}
            width={64}
            height={64}
            className="rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-bone flex items-center justify-center shrink-0">
            <Icon name="box" size={24} className="text-ink-3" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium mb-0.5">{productTitle}</div>
          <div className="text-xs text-ink-3 mb-2">
            {quantity > 1 ? `×${quantity} unidades` : "1 unidad"} · {fmtARS(unitPrice)} c/u
          </div>
          <Pill tone={st.tone} size="sm">
            {st.label}
          </Pill>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-line space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-3">Subtotal</span>
          <span>{fmtARS(unitPrice * quantity)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-3">Envío</span>
          <span>{fmtARS(shippingPrice)}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1 border-t border-line">
          <span>Total</span>
          <span>{fmtARS(total)}</span>
        </div>
      </div>
    </Card>
  );
}
