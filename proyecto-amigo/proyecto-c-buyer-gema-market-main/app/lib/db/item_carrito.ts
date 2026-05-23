import { prisma } from "@/app/lib/prisma";
import { ItemCarrito } from "@prisma/client";
import { generateUlid } from "../utils/ulidGenerator";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type CreateItemCarritoInput = {
  carritoId: string;
  productId: string;
  quantity: number;
};

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Agrega un producto al carrito (crea un ItemCarrito)
 * data: { carritoId, productId, quantity } → nuevo item con cantidad
 * Sin include: retorna solo el item, sin relaciones
 * Retorna: ItemCarrito creado con id, timestamps, etc.
 */
export async function createItemCarrito(
  data: CreateItemCarritoInput,
): Promise<ItemCarrito> {
  return prisma.itemCarrito.create({
    data: {
      id: generateUlid("itm"),
      carritoId: data.carritoId,
      productId: data.productId,
      quantity: data.quantity,
    },
  });
}

/**
 * Agrega un producto al carrito de forma segura (upsert).
 * Si el producto ya existe en el carrito, incrementa la cantidad.
 * Si no existe, lo crea.
 * Respeta la restricción @@unique([carritoId, productId]).
 * Retorna: ItemCarrito actualizado o creado.
 */
export async function upsertItemCarrito(
  data: CreateItemCarritoInput,
): Promise<ItemCarrito> {
  return prisma.itemCarrito.upsert({
    where: {
      carritoId_productId: {
        carritoId: data.carritoId,
        productId: data.productId,
      },
    },
    update: { quantity: { increment: data.quantity } },
    create: {
      id: generateUlid("itm"),
      carritoId: data.carritoId,
      productId: data.productId,
      quantity: data.quantity,
    },
  });
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Busca un item específico en el carrito por producto
 * where: { carritoId_productId } → clave única compuesta @@unique([carritoId, productId])
 * Retorna: ItemCarrito encontrado o null si el producto no está en el carrito
 */
export async function getItemByCarritoAndProduct(
  carritoId: string,
  productId: string,
): Promise<ItemCarrito | null> {
  return prisma.itemCarrito.findUnique({
    where: {
      carritoId_productId: { carritoId, productId },
    },
  });
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * Actualiza solo la cantidad de un item del carrito
 * where: { id } → localiza el item exacto
 * data: { quantity } → cambia solo el campo quantity, otros campos sin cambios
 * Retorna: ItemCarrito actualizado con nueva cantidad
 */
export async function updateItemCarritoQuantity(
  id: string,
  quantity: number,
): Promise<ItemCarrito> {
  return prisma.itemCarrito.update({
    where: { id },
    data: { quantity },
  });
}

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * Elimina un item del carrito
 * where: { id } → localiza el item exacto
 * delete: borra el registro
 * Retorna: ItemCarrito que fue eliminado
 */
export async function deleteItemCarrito(id: string): Promise<ItemCarrito> {
  return prisma.itemCarrito.delete({
    where: { id },
  });
}

/**
 * Elimina un producto específico del carrito
 * deleteMany: borra múltiples items (aunque típicamente sea uno)
 * where: { carritoId, productId } → filtra por carrito Y producto
 * Retorna: true si se eliminó algo, false si no existía ese item
 */
export async function deleteItemByCarritoAndProduct(
  carritoId: string,
  productId: string,
): Promise<boolean> {
  const result = await prisma.itemCarrito.deleteMany({
    where: {
      carritoId,
      productId,
    },
  });
  return result.count > 0;
}
