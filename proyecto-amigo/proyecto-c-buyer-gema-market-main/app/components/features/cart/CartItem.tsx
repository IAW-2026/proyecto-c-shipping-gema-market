import { Card, Icon } from "@/app/components/ui";
import { fmtARS } from "@/app/lib/utils/format";
import Image from "next/image";
import type { CartItemWithProduct } from "@/app/lib/types/cart";
import Link from "next/link";

interface CartItemProps {
  item: CartItemWithProduct;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  isPending?: boolean;
}

/**
 * Componente que representa una fila individual en el carrito.
 */
export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isPending,
}: CartItemProps) {
  const reachedStock = item.quantity >= item.stock;
  return (
    <Card padding={14} className={isPending ? "opacity-60 transition-opacity" : ""}>
      <div className="flex gap-3.5">
        <div className="w-[84px] h-[84px] rounded-r2 flex items-center justify-center shrink-0 bg-bone relative overflow-hidden">
          {item.thumbnail_url ? (
            <Image
              src={item.thumbnail_url}
              alt={item.title}
              fill
              className="object-cover"
            />
          ) : (
            <Icon name="box" size={32} className="text-ink-3/30" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/product/${item.product_id}`}
            className="text-sm font-medium mb-2 hover:underline"
          >
            {item.title}
          </Link>
          <div className="flex justify-between items-center">
            <div className="flex items-center border border-line-2 rounded-full h-8">
              <button
                onClick={() => onUpdateQuantity(item.product_id, -1)}
                disabled={isPending}
                aria-label="Disminuir cantidad"
                className="px-2.5 h-full active:scale-90 transition-transform disabled:opacity-30"
              >
                <Icon name="minus" size={14} />
              </button>
              <span className="min-w-5 text-center text-[13px] font-semibold">
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.product_id, 1)}
                disabled={isPending || reachedStock}
                aria-label="Aumentar cantidad"
                className="px-2.5 h-full active:scale-90 transition-transform disabled:opacity-30"
              >
                <Icon name="plus" size={14} />
              </button>
            </div>
            <div className="text-base font-semibold">
              {fmtARS(item.price * item.quantity)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <button
          onClick={() => onRemove(item.product_id)}
          disabled={isPending}
          aria-label={`Quitar ${item.title} del carrito`}
          className="text-xs text-danger flex items-center gap-1 hover:underline disabled:opacity-50"
        >
          <Icon name="trash" size={12} /> Quitar
        </button>
      </div>
    </Card>
  );
}
