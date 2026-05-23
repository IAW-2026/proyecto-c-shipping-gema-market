"use server";

import { revalidatePath } from "next/cache";
import {
  updateItemCarritoQuantity,
  deleteItemCarrito,
  upsertItemCarrito,
  getItemByCarritoAndProduct,
} from "@/app/lib/db/item_carrito";
import { getCurrentUserId } from "@/app/lib/auth/mapClerkId-UserId";
import { getCarritoByBuyerId, getOrCreateCarrito } from "@/app/lib/db/carrito";
import { getProductById } from "@/app/lib/api/seller";


// Helper reutilizable: verifica que el item pertenezca al carrito del usuario actual.
// Retorna el carritoId si es válido, o un error si no.
async function verifyItemOwnership(
  itemId: string,
): Promise<{ ok: true; carritoId: string } | { ok: false; error: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "No autenticado" };

  const carrito = await getCarritoByBuyerId(userId);
  if (!carrito) return { ok: false, error: "Carrito no encontrado" };

  const itemBelongsToUser = carrito.items.some((i) => i.id === itemId);
  if (!itemBelongsToUser) return { ok: false, error: "Acceso no autorizado" };

  return { ok: true, carritoId: carrito.id };
}

/**
 * Acción de servidor para agregar un producto al carrito.
 * Si el carrito no existe, lo crea.
 */
export async function addToCartAction(productId: string, quantity: number) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { ok: false, error: "Usuario no autenticado" };
    }

    // getOrCreateCarrito usa una transacción atómica para evitar race conditions:
    // si el usuario abre dos tabs y hace addToCart en ambas simultáneamente,
    // no se crean dos carritos — la transacción garantiza que solo exista uno.
    const carrito = await getOrCreateCarrito(userId);

    // Validación de stock: el stock del producto no se descuenta hasta el checkout,
    // así que sin este chequeo el usuario podría acumular en el carrito una cantidad
    // mayor al stock disponible clickeando "Agregar" varias veces.
    // Esto es UX — la autoridad real sigue siendo la creación de la orden.
    const [existingItem, product] = await Promise.all([
      getItemByCarritoAndProduct(carrito.id, productId),
      getProductById(productId),
    ]);

    if (!product) {
      return { ok: false, error: "Producto no encontrado" };
    }

    const qtyExistente = existingItem?.quantity ?? 0;
    if (qtyExistente + quantity > product.stock) {
      const disponible = product.stock - qtyExistente;
      return {
        ok: false,
        error:
          disponible <= 0
            ? `Ya tenés el stock máximo en el carrito (${product.stock} ${product.stock === 1 ? "unidad" : "unidades"})`
            : `Solo hay ${disponible} ${disponible === 1 ? "unidad disponible" : "unidades disponibles"}`,
      };
    }

    await upsertItemCarrito({
      carritoId: carrito.id,
      productId,
      quantity,
    });

    revalidatePath("/cart");
    revalidatePath(`/product/${productId}`);

    return { ok: true };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { ok: false, error: "No se pudo agregar al carrito" };
  }
}

/**
 * Acción de servidor para actualizar la cantidad de un item en el carrito.
 * Valida que la cantidad sea al menos 1 y que el item pertenezca al usuario actual.
 */
export async function updateCartItemQuantityAction(
  itemId: string,
  newQuantity: number,
) {
  if (newQuantity < 1) {
    return { ok: false, error: "La cantidad mínima es 1" };
  }

  const ownership = await verifyItemOwnership(itemId);
  if (!ownership.ok) return ownership;

  try {
    await updateItemCarritoQuantity(itemId, newQuantity);
    revalidatePath("/cart");
    return { ok: true };
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return { ok: false, error: "No se pudo actualizar la cantidad" };
  }
}

/**
 * Acción de servidor para eliminar un item del carrito.
 * Verifica que el item pertenezca al usuario actual antes de eliminar.
 */
export async function removeCartItemAction(itemId: string) {
  const ownership = await verifyItemOwnership(itemId);
  if (!ownership.ok) return ownership;

  try {
    await deleteItemCarrito(itemId);
    revalidatePath("/cart");
    return { ok: true };
  } catch (error) {
    console.error("Error removing cart item:", error);
    return {
      ok: false,
      error: "No se pudo eliminar el producto del carrito",
    };
  }
}
