import { useEffect, useOptimistic, useRef, useTransition, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toggleFavoriteAction } from "@/app/lib/actions/favorites";

export function useFavorite(productId: string, initialFavorite: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { userId, isLoaded } = useAuth();

  const [isPending, startTransition] = useTransition();
  const handledIntentRef = useRef(false);

  const [optimisticIsFav, addOptimisticIsFav] = useOptimistic(
    initialFavorite,
    (state, newState: boolean) => newState,
  );

  const performToggleFavorite = useCallback(async () => {
    // Usamos el estado optimista actual para decidir el siguiente
    addOptimisticIsFav(!optimisticIsFav);

    try {
      const result = await toggleFavoriteAction(productId);
      if (!result.ok) {
        console.error("Error al guardar favorito:", result.error);
      }
    } catch (error) {
      console.error("Error de red al alternar favorito:", error);
    }
  }, [productId, optimisticIsFav, addOptimisticIsFav]);

  const handleToggle = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!isLoaded || !userId) {
        const currentSearch = searchParams?.toString();
        const baseUrl = currentSearch ? `${pathname}?${currentSearch}` : pathname;
        const separator = baseUrl.includes("?") ? "&" : "?";
        const returnUrl = `${baseUrl}${separator}intent=toggle_favorite&product_id=${encodeURIComponent(
          productId,
        )}`;

        router.replace(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
        return;
      }

      startTransition(async () => {
        await performToggleFavorite();
      });
    },
    [
      isLoaded,
      userId,
      pathname,
      searchParams,
      productId,
      router,
      performToggleFavorite,
    ],
  );

  // Resume action after login
  useEffect(() => {
    if (!isLoaded || !userId) return;

    const intent = searchParams?.get?.("intent");
    const intentProductId = searchParams?.get?.("product_id");

    if (
      intent === "toggle_favorite" &&
      intentProductId === productId &&
      !handledIntentRef.current
    ) {
      handledIntentRef.current = true;
      router.replace(pathname, { scroll: false });

      startTransition(async () => {
        await performToggleFavorite();
      });
    }
  }, [isLoaded, userId, searchParams, productId, pathname, router, performToggleFavorite]);

  return {
    isFavorite: optimisticIsFav,
    isPending,
    toggle: handleToggle,
  };
}
