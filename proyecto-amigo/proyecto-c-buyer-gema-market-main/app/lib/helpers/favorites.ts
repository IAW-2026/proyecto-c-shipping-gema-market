import { getCurrentUserId } from "@/app/lib/auth/mapClerkId-UserId";
import {
  countFavoritosByBuyerId,
  getFavoritosIdsPaginated,
} from "@/app/lib/db/favorito";
import { getProductsBatch } from "@/app/lib/api/seller";
import type { ProductListItem } from "@/app/lib/types/product";

export async function getFavoritesWithProducts(
  page: number,
  pageSize: number,
): Promise<{ items: ProductListItem[]; total: number }> {
  const userId = await getCurrentUserId();

  try {
    if (!userId) return { items: [], total: 0 };

    const [favoriteProductIds, total] = await Promise.all([
      getFavoritosIdsPaginated(userId, page, pageSize),
      countFavoritosByBuyerId(userId),
    ]);

    if (favoriteProductIds.length === 0) {
      return { items: [], total };
    }

    const response = await getProductsBatch(favoriteProductIds);
    return { items: response?.products || [], total };
  } catch (error) {
    console.error("Error fetching favorites with products:", error);
    return { items: [], total: 0 };
  }
}
