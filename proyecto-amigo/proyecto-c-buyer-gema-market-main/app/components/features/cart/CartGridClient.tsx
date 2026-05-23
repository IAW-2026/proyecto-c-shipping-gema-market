"use client";

// Auto-Rollback: Si alguna de las Server Actions falla
// (por ejemplo, si se cae la conexión), React revertirá
// automáticamente los cambios optimistas y el carrito
// volverá a mostrar su estado real en la base de datos
// sin que tengas que programar nada extra.

import { Button, EmptyState } from "@/app/components/ui";
import React, { useState, useOptimistic, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { CartItemWithProduct } from "@/app/lib/types/cart";
import {
  updateCartItemQuantityAction,
  removeCartItemAction,
} from "@/app/lib/actions/cart";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

interface CartGridClientProps {
  initialItems: CartItemWithProduct[];
}

type OptimisticAction =
  | { type: "update"; id: string; quantity: number }
  | { type: "remove"; id: string };

export default function CartGridClient({ initialItems }: CartGridClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // Estado optimista: toma initialItems y los actualiza según la acción
  const [optimisticItems, addOptimisticAction] = useOptimistic(
    initialItems,
    (state, action: OptimisticAction) => {
      switch (action.type) {
        case "update":
          return state.map((item) =>
            item.product_id === action.id
              ? { ...item, quantity: action.quantity }
              : item,
          );
        case "remove":
          return state.filter((item) => item.product_id !== action.id);
        default:
          return state;
      }
    },
  );

  const subtotal = useMemo(
    () => optimisticItems.reduce((s, i) => s + i.price * i.quantity, 0),
    [optimisticItems],
  );

  // Handlers
  const updateQuantity = async (id: string, delta: number) => {
    const item = optimisticItems.find((i) => i.product_id === id);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 1) return;

    // Marcamos el ID como pendiente
    setPendingIds((prev) => new Set(prev).add(id));

    // Ejecutamos la acción dentro de una transición
    startTransition(async () => {
      try {
        // 1. Aplicamos el cambio optimista inmediatamente en la UI
        addOptimisticAction({ type: "update", id, quantity: newQty });

        // 2. Ejecutamos la acción del servidor
        const result = await updateCartItemQuantityAction(item.item_id, newQty);
        if (!result.ok) {
          console.error(result.error);
        }
      } finally {
        // Quitamos el ID de pendientes al terminar
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  };

  const remove = async (id: string) => {
    const item = optimisticItems.find((i) => i.product_id === id);
    if (!item) return;

    setPendingIds((prev) => new Set(prev).add(id));

    startTransition(async () => {
      try {
        // 1. Aplicamos la eliminación optimista
        addOptimisticAction({ type: "remove", id });

        // 2. Ejecutamos la acción del servidor
        const result = await removeCartItemAction(item.item_id);
        if (!result.ok) {
          console.error(result.error);
        }
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  };

  if (optimisticItems.length === 0) {
    return (
      <EmptyState
        icon="cart"
        title="Carrito vacío"
        body="Agregá productos para empezar tu mudanza."
        action={
          <Button variant="accent" onClick={() => router.push("/")}>
            Explorar
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="p-4 flex flex-col gap-3">
        {optimisticItems.map((item) => (
          <CartItem
            key={item.product_id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={remove}
            isPending={pendingIds.has(item.product_id)}
          />
        ))}
      </div>

      <CartSummary
        subtotal={subtotal}
        onCheckout={() => router.push("/checkout")}
        isPending={isPending}
      />
    </div>
  );
}
