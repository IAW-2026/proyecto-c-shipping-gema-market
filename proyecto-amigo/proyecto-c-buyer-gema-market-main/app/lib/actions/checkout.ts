"use server";

/**
 * Server Actions del flujo de Checkout.
 *
 * Dos acciones principales:
 *  1. `requestShippingQuoteAction` — cotiza el envío POR CADA PRODUCTO del carrito (Paso 1)
 *  2. `createCheckoutAction`       — crea las órdenes y redirige al pago (Paso 2)
 *
 * Regla de cotización:
 *  - Cada producto distinto en el carrito obtiene su propio quote_id y precio de envío.
 *  - La `quantity` de un item NO multiplica los quotes (enviar 2 sillas = 1 quote de sillas).
 *  - Tener una silla y una mesa = 2 quotes independientes.
 *
 * Flujo completo:
 *  Carrito → cotizar envío por item → crear órdenes en BD → crear orden de pago → checkout_url
 *
 * @see docs/apis.md — POST /api/shipping/cotizaciones
 * @see docs/apis.md — POST /api/payments/ordenes-de-pago
 */

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/app/lib/auth/mapClerkId-UserId";
import { getCarritoByBuyerId } from "@/app/lib/db/carrito";
import { getProductsBatch } from "@/app/lib/api/seller";
import { requestShippingQuote } from "@/app/lib/api/shipping";
import { createPaymentOrder } from "@/app/lib/api/payments";
import { RequiredAddressSchema } from "@/app/lib/schemas/address";
import { prisma } from "@/app/lib/prisma";
import { generateUlid } from "@/app/lib/utils/ulidGenerator";
import type { CheckoutItem } from "@/app/lib/types/orders";

// ── Constantes ────────────────────────────────────────────────────────────────

function getReturnUrl(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (!base) throw new Error("NEXT_PUBLIC_BASE_URL must be set in production");
  return `${base}/orders`;
}

// ── Tipos de resultado ────────────────────────────────────────────────────────

export type QuoteActionResult =
  | { ok: true; items: CheckoutItem[] }
  | { ok: false; error: string };

export type CheckoutActionResult =
  | { ok: true; checkout_url: string }
  | { ok: false; error: string };

// ── ACCIÓN 1: Cotizar envío por item ─────────────────────────────────────────

/**
 * Resuelve los productos del carrito y cotiza el envío para cada uno individualmente.
 *
 * Regla: un quote por producto distinto, sin importar la quantity.
 *   - 1 silla ×2 unidades → 1 quote (para el producto "silla")
 *   - 1 silla + 1 mesa    → 2 quotes independientes
 *
 * Cada CheckoutItem retornado ya lleva su `quote` embebido para que
 * createCheckoutAction pueda usarlo directamente.
 *
 * @param address - Dirección de entrega del Paso 1
 */
export async function requestShippingQuoteAction(address: {
  street: string;
  number: string;
  zip: string;
}): Promise<QuoteActionResult> {
  const parsed = RequiredAddressSchema.safeParse(address);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { ok: false, error: "Debés iniciar sesión para continuar." };
    }

    const carrito = await getCarritoByBuyerId(userId);
    if (!carrito || carrito.items.length === 0) {
      return { ok: false, error: "Tu carrito está vacío." };
    }

    const productIds = carrito.items.map((i) => i.productId);
    const { products } = await getProductsBatch(productIds);

    if (products.length === 0) {
      return {
        ok: false,
        error: "No se pudieron obtener los datos de los productos.",
      };
    }

    const productMap = new Map(products.map((p) => [p.product_id, p]));

    const quoteResults = await Promise.all(
      carrito.items.map(async (item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;

        const quote = await requestShippingQuote({
          destination_address: parsed.data,
          product_id: product.product_id,
          weight_kg: product.weight || 5,
          height_m: product.height || 0.5,
          width_m: product.width || 0.5,
          depth_m: product.depth || 0.5,
        });

        return {
          itemId: item.id,
          productId: item.productId,
          sellerId: product.seller_id,
          productTitle: product.title,
          productImage: product.thumbnail_url,
          quantity: item.quantity,
          unitPrice: product.price,
          quote,
        };
      }),
    );

    const checkoutItems: CheckoutItem[] = quoteResults.filter(
      (r): r is NonNullable<typeof r> => r !== null,
    );

    if (checkoutItems.length === 0) {
      return { ok: false, error: "No hay productos válidos en el carrito." };
    }

    return { ok: true, items: checkoutItems };
  } catch (error) {
    console.error("[requestShippingQuoteAction] Error:", error);
    return {
      ok: false,
      error: "No se pudo calcular el envío. Intentá de nuevo.",
    };
  }
}

// ── ACCIÓN 2: Crear checkout ──────────────────────────────────────────────────

/**
 * Orquesta el flujo completo de creación de órdenes y redirige al pago.
 *
 * Usa transacciones Prisma en tres fases para garantizar consistencia:
 *
 *  FASE 1 — prisma.$transaction: Crear todas las órdenes atómicamente.
 *    Si falla la creación de cualquier orden, ninguna se persiste.
 *
 *  FASE 2 — Llamada externa a Payments App (no puede ser transaccional).
 *    Si falla: rollback atómico → todas las órdenes pasan a "cancelled".
 *
 *  FASE 3 — prisma.$transaction: Actualizar órdenes con paymentId + vaciar carrito.
 *    Ambas operaciones son atómicas: el carrito no se vacía si falla la
 *    actualización de las órdenes, preservando consistencia.
 *
 * @param items - CheckoutItems con quote embebido (de requestShippingQuoteAction)
 */
export async function createCheckoutAction(
  items: CheckoutItem[],
): Promise<CheckoutActionResult> {
  const createdOrderIds: string[] = [];

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { ok: false, error: "Debés iniciar sesión para continuar." };
    }

    const buyer = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });
    if (!buyer?.fullName) {
      return {
        ok: false,
        error: "Completá tu nombre en el perfil para continuar.",
      };
    }

    const carrito = await getCarritoByBuyerId(userId);
    if (!carrito || carrito.items.length === 0) {
      return { ok: false, error: "Tu carrito está vacío." };
    }

    // ── FASE 1: Crear todas las órdenes atómicamente ──────────────────────────
    // Si cualquier create falla, Prisma hace rollback de todas automáticamente.
    const createdOrdenes = await prisma.$transaction(
      items.map((item) =>
        prisma.orden.create({
          data: {
            id: generateUlid("ord"),
            buyerId: userId,
            sellerId: item.sellerId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            shippingPrice: item.quote.price,
            totalAmount: item.unitPrice * item.quantity + item.quote.price,
            currency: "ARS",
            status: "created",
            quoteId: item.quote.quote_id,
            paymentId: null,
            shippingId: null,
          },
        }),
      ),
    );

    // Lo crea para un posible rollback en Fase 2 (si falla la llamada a Payments App)
    createdOrdenes.forEach((o) => createdOrderIds.push(o.id));

    const ordersForPayment = createdOrdenes.map((orden, i) => ({
      order_id: orden.id,
      seller_id: items[i].sellerId,
      product_id: items[i].productId,
      quantity: items[i].quantity,
      unit_price: items[i].unitPrice,
      quote: {
        quote_id: items[i].quote.quote_id,
        shipping_price: items[i].quote.price,
      },
    }));

    // ── FASE 2: Llamada externa a Payments App ────────────────────────────────
    // No puede estar dentro de una transacción Prisma (es una llamada HTTP).
    // Si falla: rollback atómico de todas las órdenes creadas en Fase 1.
    let paymentResult;
    try {
      paymentResult = await createPaymentOrder({
        buyer_id: userId,
        buyer_name: buyer.fullName,
        orders: ordersForPayment,
        currency: "ARS",
        return_url: getReturnUrl(),
      });
    } catch (paymentError) {
      console.error(
        "[createCheckoutAction] Payments App falló, cancelando órdenes:",
        paymentError,
      );
      await prisma.$transaction(
        createdOrderIds.map((orderId) =>
          prisma.orden.update({
            where: { id: orderId },
            data: { status: "cancelled" },
          }),
        ),
      );
      return {
        ok: false,
        error: "No se pudo iniciar el pago. Intentá de nuevo.",
      };
    }

    // ── FASE 3: Confirmar órdenes + eliminar carrito atómicamente ────────────
    // El carrito se elimina en lugar de vaciarse: CASCADE en la relación
    // Carrito → ItemCarrito borra los items en una sola operación a nivel DB,
    // sin roundtrips adicionales. getOrCreateCarrito recrea el carrito vacío
    // en el próximo addToCart.
    // Si falla la actualización de órdenes, el carrito no se elimina — el usuario
    // puede reintentar el checkout con el mismo carrito intacto.
    await prisma.$transaction([
      ...createdOrderIds.map((orderId) =>
        prisma.orden.update({
          where: { id: orderId },
          data: {
            paymentId: paymentResult.payment_id,
            status: "awaiting_payment",
          },
        }),
      ),
      prisma.carrito.delete({ where: { id: carrito.id } }),
    ]);

    revalidatePath("/cart");
    revalidatePath("/orders");

    return { ok: true, checkout_url: paymentResult.checkout_url };
  } catch (error) {
    console.error("[createCheckoutAction] Error inesperado:", error);

    if (createdOrderIds.length > 0) {
      await prisma
        .$transaction(
          createdOrderIds.map((orderId) =>
            prisma.orden.update({
              where: { id: orderId },
              data: { status: "cancelled" },
            }),
          ),
        )
        .catch((e) =>
          console.error("[createCheckoutAction] Error en rollback:", e),
        );
    }

    return {
      ok: false,
      error: "Ocurrió un error inesperado. Intentá de nuevo.",
    };
  }
}
