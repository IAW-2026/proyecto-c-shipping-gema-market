import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { addToCartAction } from "@/app/lib/actions/cart";

export type Notification = {
  type: "success" | "error";
  message: string;
} | null;

export function useCart(productId: string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { userId, isLoaded } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [notification, setNotification] = useState<Notification>(null);
  const handledIntentRef = useRef(false);

  const performAddToCart = useCallback(
    async (qty: number) => {
      const result = await addToCartAction(productId, qty);

      if (result.ok) {
        setNotification({
          type: "success",
          message: `¡Agregado al carrito! (${qty} ${qty === 1 ? "unidad" : "unidades"})`,
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          type: "error",
          message: result.error || "No se pudo agregar al carrito",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    },
    [productId],
  );

  const handleAddToCart = useCallback(
    (quantity: number) => {
      if (!isLoaded || !userId) {
        const returnUrl = `${pathname}?intent=add_to_cart&product_id=${encodeURIComponent(
          productId,
        )}&quantity=${quantity}`;
        router.replace(
          `/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`,
        );
        return;
      }

      startTransition(async () => {
        await performAddToCart(quantity);
      });
    },
    [isLoaded, userId, pathname, productId, router, performAddToCart],
  );

  // Detectar si volvimos del login con la intención de agregar al carrito
  useEffect(() => {
    if (!isLoaded || !userId) return;

    const intent = searchParams?.get?.("intent");
    const pId = searchParams?.get?.("product_id");
    const qty = parseInt(searchParams?.get?.("quantity") || "1", 10) || 1;

    if (
      intent === "add_to_cart" &&
      pId === productId &&
      !handledIntentRef.current
    ) {
      handledIntentRef.current = true;
      router.replace(pathname, { scroll: false });

      startTransition(async () => {
        await performAddToCart(qty);
      });
    }
  }, [
    isLoaded,
    userId,
    searchParams,
    pathname,
    router,
    productId,
    performAddToCart,
  ]);

  return {
    isPending,
    notification,
    setNotification,
    handleAddToCart,
  };
}
