"use client";

import { useState } from "react";
import { Button, Icon, Toast } from "@/app/components/ui";
import { useCart } from "@/app/components/products/hooks/useCart";

interface ProductCartActionsProps {
  productId: string;
  stock: number;
}

export default function ProductCartActions({
  productId,
  stock,
}: ProductCartActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { isPending, notification, handleAddToCart } = useCart(productId);

  // Mantener la última notificación visible durante la animación de salida del Toast,
  // así no parpadea cambiando de "Ver carrito" a null cuando notification pasa a null.
  const [displayNotification, setDisplayNotification] = useState(notification);
  const [prevNotification, setPrevNotification] = useState(notification);

  if (prevNotification !== notification) {
    setPrevNotification(notification);
    if (notification) setDisplayNotification(notification);
  }

  return (
    <>
      <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-line px-4 py-3 flex gap-2.5 z-50 max-w-150 mx-auto lgx:static lgx:max-w-none lgx:bg-transparent lgx:backdrop-blur-none lgx:border-t lgx:border-line lgx:px-0 lgx:pt-4 lgx:pb-0 lgx:mt-5">
        <div className="flex items-center border border-line-2 rounded-full h-12 bg-paper shadow-sm">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Disminuir cantidad"
            disabled={quantity <= 1 || isPending}
            className="flex h-full w-12 items-center justify-center active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Icon name="minus" size={16} />
          </button>
          <span className="w-12 text-center font-bold text-lg select-none">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
            aria-label="Aumentar cantidad"
            disabled={quantity >= (stock || 99) || isPending}
            className="flex h-full w-12 items-center justify-center active:scale-90 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Icon name="plus" size={16} />
          </button>
        </div>
        <Button
          size="lg"
          full
          variant="accent"
          onClick={() => handleAddToCart(quantity)}
          loading={isPending}
          disabled={isPending}
        >
          Agregar al carrito
        </Button>
      </div>

      <Toast
        show={!!notification}
        type={displayNotification?.type || "success"}
        message={displayNotification?.message || ""}
        action={
          displayNotification?.type !== "error"
            ? { label: "Ver carrito", href: "/cart" }
            : undefined
        }
      />
    </>
  );
}
