import { prisma } from "@/app/lib/prisma";
import { Carrito, Prisma } from "@prisma/client";
import { generateUlid } from "../utils/ulidGenerator";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type CreateCarritoInput = {
  buyerId: string;
};

type CarritoConRelaciones = Prisma.CarritoGetPayload<{
  include: { items: true };
}>;

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────
/**
 * Crea un nuevo carrito para un comprador
 * Retorna: Carrito creado
 */
export async function createCarrito(
  data: CreateCarritoInput,
): Promise<Carrito> {
  return prisma.carrito.create({
    data: {
      id: generateUlid("car"),
      buyerId: data.buyerId,
    },
  });
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────

/**
 * Busca un carrito específico por su ID
 * where: { id } → localiza el carrito exacto
 * include: items + buyer → retorna carrito con sus items y datos del comprador
 * Retorna: Carrito con relaciones o null si no existe
 */
export async function getCarritoById(
  id: string,
): Promise<CarritoConRelaciones | null> {
  return prisma.carrito.findUnique({
    where: { id },
    include: { items: true },
  });
}
/**
 * Busca el carrito de un comprador específico.
 * Usa findUnique por el campo único buyerId.
 */
export async function getCarritoByBuyerId(
  buyerId: string,
): Promise<CarritoConRelaciones | null> {
  return prisma.carrito.findUnique({
    where: { buyerId },
    include: { items: true },
  });
}

/**
 * Retorna el carrito del comprador si existe, o lo crea si no.
 * Usa upsert atómico sobre buyerId (@unique) — elimina la race condition
 * de crear dos carritos si el usuario agrega al carrito desde dos tabs simultáneamente.
 */
export async function getOrCreateCarrito(
  buyerId: string,
): Promise<CarritoConRelaciones> {
  return prisma.carrito.upsert({
    where: { buyerId },
    create: { id: generateUlid("car"), buyerId },
    update: {},
    include: { items: true },
  });
}
// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────

/**
 * Vacía un carrito: elimina todos sus items sin borrar el carrito
 * deleteMany: borra múltiples items
 * where: { carritoId } → filtra solo los items del carrito especificado
 * Retorna: void (no retorna datos, solo ejecuta la acción)
 */
export async function clearCarritoItems(carritoId: string): Promise<void> {
  await prisma.itemCarrito.deleteMany({
    where: { carritoId },
  });
}

