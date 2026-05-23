import type { OrdenConBuyer } from "@/app/lib/db/orden";
import type { BatchProductItem } from "@/app/lib/types/product";
import type { OrderForUI, OrderStatus } from "@/app/lib/types/orders";

export function mapOrdenesToUI(
  ordenes: OrdenConBuyer[],
  productMap: Map<string, BatchProductItem>,
): OrderForUI[] {
  return ordenes.map((o) => {
    const product = productMap.get(o.productId);
    return {
      id: o.id,
      date: o.createdAt.toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status: o.status as OrderStatus,
      productTitle: product?.title ?? "Producto",
      productThumbnail: product?.thumbnail_url ?? "",
      quantity: o.quantity,
      unitPrice: Number(o.unitPrice),
      shippingPrice: Number(o.shippingPrice),
      total: Number(o.totalAmount),
      paymentId: o.paymentId ?? undefined,
      shippingId: o.shippingId ?? undefined,
    };
  });
}
