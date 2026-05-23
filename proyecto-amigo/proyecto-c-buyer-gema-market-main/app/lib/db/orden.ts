import { prisma } from "@/app/lib/prisma";
import { Orden, OrdenStatus, Prisma } from "@prisma/client";
import { generateUlid } from "../utils/ulidGenerator";

// ─────────────────────────────────────────────
// Types

// ─────────────────────────────────────────────

type CreateOrdenInput = {
  buyerId: string;
  sellerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  shippingPrice: number;
  totalAmount: number;
  currency?: string;
  status?: OrdenStatus;
  quoteId?: string;
  paymentId?: string;
  shippingId?: string;
};

type UpdateOrdenInput = Partial<{
  quantity: number;
  status: OrdenStatus;
  paymentId: string;
  shippingId: string;
  quoteId: string;
}>;

export type OrdenConBuyer = Prisma.OrdenGetPayload<{
  include: { buyer: true };
}>;

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * Crea una nueva orden (compra de un producto)
 * Valores por defecto: currency='ARS', status='created', IDs de relaciones=null
 * Retorna: Orden creada
 */
export async function createOrden(data: CreateOrdenInput): Promise<Orden> {
  return prisma.orden.create({
    data: {
      id: generateUlid("ord"),
      buyerId: data.buyerId,
      sellerId: data.sellerId,
      productId: data.productId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      shippingPrice: data.shippingPrice,
      totalAmount: data.totalAmount,
      currency: data.currency ?? "ARS",
      status: data.status ?? "created",
      quoteId: data.quoteId ?? null,
      paymentId: data.paymentId ?? null,
      shippingId: data.shippingId ?? null,
    },
  });
}

// ─────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────
/**
 * Busca una orden por su ID
 * where: { id } → localiza la orden única
 * include: { buyer: true } → retorna orden con datos del comprador
 * Retorna: Orden encontrada con datos del buyer o null si no existe
 */ export async function getOrdenById(
  id: string,
): Promise<OrdenConBuyer | null> {
  return prisma.orden.findUnique({
    where: { id },
    include: { buyer: true },
  });
}

export async function getOrdenesByBuyerId(
  buyerId: string,
  opts: { page?: number; pageSize?: number; statuses?: OrdenStatus[] } = {},
): Promise<OrdenConBuyer[]> {
  const { page = 1, pageSize = 20, statuses } = opts;
  return prisma.orden.findMany({
    where: { buyerId, ...(statuses ? { status: { in: statuses } } : {}) },
    include: { buyer: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
}

export async function countOrdenesByBuyerId(
  buyerId: string,
  statuses?: OrdenStatus[],
): Promise<number> {
  return prisma.orden.count({
    where: { buyerId, ...(statuses ? { status: { in: statuses } } : {}) },
  });
}

export async function getOrdenesPaginatedAdmin(opts: {
  skip: number;
  take: number;
  search?: string;
}): Promise<OrdenConBuyer[]> {
  const where = opts.search
    ? {
        buyer: {
          OR: [
            { fullName: { contains: opts.search, mode: "insensitive" as const } },
            { email: { contains: opts.search, mode: "insensitive" as const } },
          ],
        },
      }
    : undefined;
  return prisma.orden.findMany({
    where,
    include: { buyer: true },
    orderBy: { createdAt: "desc" },
    skip: opts.skip,
    take: opts.take,
  });
}

export async function countOrdenesAdmin(search?: string): Promise<number> {
  const where = search
    ? {
        buyer: {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        },
      }
    : undefined;
  return prisma.orden.count({ where });
}

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────
/**
 * Actualiza una orden existente
 * data: { quantity?, status?, paymentId?, shippingId?, quoteId? } → cambios parciales
 * Retorna: Orden modificada
 */
export async function updateOrden(
  id: string,
  data: UpdateOrdenInput,
): Promise<Orden> {
  return prisma.orden.update({
    where: { id },
    data,
  });
}

