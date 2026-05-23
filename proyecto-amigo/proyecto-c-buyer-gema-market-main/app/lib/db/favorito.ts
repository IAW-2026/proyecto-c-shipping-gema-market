import { prisma } from "@/app/lib/prisma";
import { Favorito } from "@prisma/client";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type CreateFavoritoInput = {
  buyerId: string;
  productId: string;
};

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
/**
 * Agrega un producto a los favoritos de un comprador
 * Retorna: Favorito creado
 */
export async function createFavorito(data: CreateFavoritoInput): Promise<Favorito> {
  return prisma.favorito.create({
    data: {
      buyerId: data.buyerId,
      productId: data.productId,
    },
  });
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Busca un favorito específico por comprador y producto
 * Retorna: Favorito encontrado o null si no existe
 */
export async function getFavorito(
  buyerId: string,
  productId: string,
): Promise<Favorito | null> {
  return prisma.favorito.findUnique({
    where: {
      buyerId_productId: { buyerId, productId },
    },
  });
}
/**
 * Verifica si un producto está marcado como favorito por un comprador
 * findUnique: busca por clave compuesta (buyerId_productId)
 * where: { buyerId_productId } → localizador único
 * Sin include: no necesita relaciones, solo confirmar existencia
 * Retorna: true si es favorito, false si no existe
 */ export async function isFavorited(
  buyerId: string,
  productId: string,
): Promise<boolean> {
  const favorito = await prisma.favorito.findUnique({
    where: {
      buyerId_productId: {
        buyerId,
        productId,
      },
    },
  });
  return favorito !== null;
}

// Sirve para poder marcar el corazon en la pantalla si esta
// agregado como favorito o no

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────
/**
 * Elimina un favorito específico
 * Retorna: Favorito que fue eliminado
 */
export async function deleteFavorito(buyerId: string, productId: string): Promise<Favorito> {
  return prisma.favorito.delete({
    where: {
      buyerId_productId: { buyerId, productId },
    },
  });
}
// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────

/**
 * Alterna el estado de un favorito: agrega si no existe, elimina si existe
 * Usa transacción para garantizar atomicidad y evitar race conditions
 * Retorna: true si ahora es favorito, false si ya no lo es
 */
export async function toggleFavorito(
  buyerId: string,
  productId: string,
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const exists = await tx.favorito.findUnique({
      where: {
        buyerId_productId: {
          buyerId,
          productId,
        },
      },
    });

    if (exists) {
      await tx.favorito.delete({
        where: {
          buyerId_productId: {
            buyerId,
            productId,
          },
        },
      });
      return false; // Ahora no es favorito
    } else {
      await tx.favorito.create({
        data: { buyerId, productId },
      });
      return true; // Ahora es favorito
    }
  });
}

/**
 * Obtiene solo los IDs de los productos favoritos de un comprador.
 * Útil para la renderización rápida de listados.
 */
export async function getFavoritosIds(buyerId: string): Promise<string[]> {
  const favoritos = await prisma.favorito.findMany({
    where: { buyerId },
    select: { productId: true },
  });
  return favoritos.map((f) => f.productId);
}

export async function getFavoritosIdsPaginated(
  buyerId: string,
  page: number,
  pageSize: number,
): Promise<string[]> {
  const favoritos = await prisma.favorito.findMany({
    where: { buyerId },
    select: { productId: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  return favoritos.map((f) => f.productId);
}

export async function countFavoritosByBuyerId(buyerId: string): Promise<number> {
  return prisma.favorito.count({ where: { buyerId } });
}

