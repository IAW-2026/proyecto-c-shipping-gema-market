/**
 * Tipos de orden según la documentación de la Buyer App y el esquema de Prisma.
 * @see docs/apis.md — GET /api/buyer/admin/ordenes
 * @see prisma/schema.prisma — enum `OrdenStatus`
 */

import type { ShippingQuote } from "@/app/lib/types/api/shipping";

export type OrderStatus =
  | "created"
  | "awaiting_payment"
  | "paid"
  | "shipping"
  | "delivered"
  | "shipping_failed"
  | "cancelled";

// ── Tipos del flujo de Checkout ───────────────────────────────────────────────

/**
 * Un ítem del checkout: producto del carrito enriquecido con datos de la Seller App
 * y su propia cotización de envío (una por producto distinto, independiente de quantity).
 */
export interface CheckoutItem {
  itemId: string;        // ID del ItemCarrito en BD
  productId: string;     // FK lógica → Seller App
  sellerId: string;      // FK lógica → Seller App
  productTitle: string;  // Nombre del producto (de Seller App)
  productImage?: string; // Primera imagen del producto (de Seller App)
  quantity: number;
  unitPrice: number;     // Precio unitario al momento del checkout
  quote: ShippingQuote;  // Cotización de envío propia de este producto
}

// ── Tipos de UI ───────────────────────────────────────────────────────────────

/** Orden para el listado de órdenes del comprador. */
export interface OrderForUI {
  id: string;
  date: string;
  status: OrderStatus;
  productTitle: string;
  productThumbnail: string;
  quantity: number;
  unitPrice: number;
  shippingPrice: number;
  total: number;
  paymentId?: string;
  shippingId?: string;
}

/** Orden para la vista de detalle. */
export interface OrderDetailForUI {
  id: string;
  status: OrderStatus;
  date: string;
  quantity: number;
  unitPrice: number;
  shippingPrice: number;
  total: number;
  paymentId?: string;
  shippingId?: string;
  productTitle: string;
  productThumbnail: string;
}
