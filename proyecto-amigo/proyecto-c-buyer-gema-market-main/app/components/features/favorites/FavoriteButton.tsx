"use client";

import { Icon } from "@/app/components/ui";
import { useFavorite } from "./hooks/useFavorite";

interface FavoriteButtonProps {
  productId: string;
  initialFavorite: boolean;
  className?: string;
}

export default function FavoriteButton({
  productId,
  initialFavorite,
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, isPending, toggle } = useFavorite(
    productId,
    initialFavorite,
  );

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`flex items-center justify-center transition-colors ${className} ${
        isFavorite ? "text-forest" : "text-ink-2 hover:text-forest"
      } ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}
    >
      <Icon name="heart" size={16} filled={isFavorite} />
    </button>
  );
}
