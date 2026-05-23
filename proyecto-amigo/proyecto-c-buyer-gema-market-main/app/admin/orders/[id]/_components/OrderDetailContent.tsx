import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/lib/auth/roles";
import { getOrdenById } from "@/app/lib/db/orden";
import { getProductById } from "@/app/lib/api/seller";
import { Pill } from "@/app/components/ui";
import { OrderTimeline } from "@/app/components/features/orders/orderDetail/OrderTimeline";
import { OrderProductCard } from "@/app/components/features/orders/OrderProductCard";
import { ORDER_STATUS_LABEL } from "@/app/lib/constants/orders";
import type { OrderStatus } from "@/app/lib/types/orders";

export async function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const orden = await getOrdenById(id);
  if (!orden) notFound();

  const product = await getProductById(orden.productId);

  const status = orden.status as OrderStatus;
  const { label, tone } = ORDER_STATUS_LABEL[status];
  const date = orden.createdAt.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-sm text-ink-3 hover:text-ink transition-colors"
      >
        ← Volver a órdenes
      </Link>

      <div className="flex items-center gap-3 mt-4 mb-5 flex-wrap">
        <div>
          <div className="text-xs text-ink-3 mb-0.5">{date}</div>
          <div className="font-mono text-sm font-medium text-ink">{orden.id}</div>
        </div>
        <Pill tone={tone} size="sm">{label}</Pill>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-paper border border-line rounded-r3 p-4">
          <p className="text-xs font-mono uppercase tracking-[0.08em] text-ink-3 mb-2">
            Comprador
          </p>
          <p className="font-medium text-ink">{orden.buyer.fullName || "—"}</p>
          <p className="text-sm text-ink-3">{orden.buyer.email}</p>
        </div>

        <div className="bg-paper border border-line rounded-r3 p-4">
          <p className="text-xs font-mono uppercase tracking-[0.08em] text-ink-3 mb-2">
            IDs externos
          </p>
          <div className="space-y-1.5">
            <IdRow label="Payment" value={orden.paymentId} />
            <IdRow label="Shipping" value={orden.shippingId} />
            <IdRow label="Quote" value={orden.quoteId} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <OrderTimeline
          status={status}
          paymentId={orden.paymentId ?? undefined}
          shippingId={orden.shippingId ?? undefined}
        />
        <OrderProductCard
          status={status}
          productTitle={product?.title ?? "Producto"}
          productThumbnail={product?.images?.[0] ?? ""}
          quantity={orden.quantity}
          unitPrice={Number(orden.unitPrice)}
          shippingPrice={Number(orden.shippingPrice)}
          total={Number(orden.totalAmount)}
        />
      </div>
    </div>
  );
}

function IdRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-ink-3 w-16 shrink-0">{label}</span>
      <span className="font-mono text-xs text-ink break-all">{value ?? "—"}</span>
    </div>
  );
}
