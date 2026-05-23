"use client";

/**
 * CheckoutClient — Componente cliente que maneja el flujo de 2 pasos del checkout.
 *
 * Paso 1 (Dirección): el usuario confirma/edita su dirección de entrega.
 *                     Al continuar, llama requestShippingQuoteAction() para obtener
 *                     un quote de envío por cada producto del carrito.
 *
 * Paso 2 (Resumen): muestra los productos, precios de envío individuales y el total.
 *                   Al pagar, llama createCheckoutAction() que:
 *                     - Crea las órdenes en BD
 *                     - Obtiene checkout_url de Payments App
 *                     - Redirige al usuario a esa URL
 *
 * @param initialAddress - Dirección guardada del usuario (desde servidor)
 */

import { useState, useTransition, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { TopBar, Button, Icon } from "@/app/components/ui";
import { fmtARS } from "@/app/lib/utils/format";
import {
  requestShippingQuoteAction,
  createCheckoutAction,
} from "@/app/lib/actions/checkout";
import type { CheckoutItem } from "@/app/lib/types/orders";

// ── Tipos ─────────────────────────────────────────────────────────────────────

import type { Address } from "@/app/lib/types/user";
import { CheckoutAddressStep } from "./CheckoutAddressStep";
import { CheckoutSummaryStep } from "./CheckoutSummaryStep";

interface CheckoutClientProps {
  initialAddress: Address;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function CheckoutClient({
  initialAddress,
}: CheckoutClientProps) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [addr, setAddr] = useState<Address>(initialAddress);
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const steps = ["Dirección", "Resumen y pago"];

  // ── Cálculos de totales ────────────────────────────────────────────────────

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const totalShipping = items.reduce((sum, item) => sum + item.quote.price, 0);
  const total = subtotal + totalShipping;

  // ── Paso 1 → Paso 2: cotizar envío ────────────────────────────────────────

  function handleContinue() {
    setError(null);

    startTransition(async () => {
      const result = await requestShippingQuoteAction({
        street: addr.street,
        number: addr.number,
        zip: addr.zip,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setItems(result.items);
      setStep(2);
    });
  }

  // ── Paso 2: confirmar y pagar ──────────────────────────────────────────────

  function handlePay() {
    setError(null);

    startTransition(async () => {
      const result = await createCheckoutAction(items);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // Redirigir a la checkout_url de la Payments App
      // (en mock: /orders — en producción: URL de Mercado Pago)
      router.push(result.checkout_url);
    });
  }

  // ── Input handler ──────────────────────────────────────────────────────────

  const handleInput =
    (key: keyof Address) => (e: ChangeEvent<HTMLInputElement>) =>
      setAddr((prev) => ({ ...prev, [key]: e.target.value }));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="pb-32">
      <TopBar back title="Checkout" />

      <div className="pt-4 px-4 pb-2 max-w-[600px] mx-auto">
        {/* Stepper */}
        <ol aria-label="Pasos del checkout" className="flex gap-1.5 mb-6">
          {steps.map((s, i) => (
            <li
              key={s}
              className="flex-1"
              aria-current={i + 1 === step ? "step" : undefined}
            >
              <div
                className={`h-1 rounded-full mb-1.5 transition-colors ${
                  i + 1 <= step ? "bg-forest" : "bg-line-2"
                }`}
              />
              <div
                className={`text-[11px] font-mono font-medium transition-colors ${
                  i + 1 === step ? "text-forest" : "text-ink-3"
                }`}
              >
                0{i + 1} · {s}
              </div>
            </li>
          ))}
        </ol>

        {/* Error global */}
        {error && (
          <div
            role="alert"
            className="mb-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex gap-2 items-center"
          >
            <Icon name="alertCircle" size={16} />
            {error}
          </div>
        )}

        {/* ── PASO 1: Dirección ─────────────────────────────────────────── */}
        {step === 1 && (
          <CheckoutAddressStep addr={addr} handleInput={handleInput} />
        )}

        {/* ── PASO 2: Resumen ──────────────────────────────────────────────── */}
        {step === 2 && (
          <CheckoutSummaryStep
            addr={addr}
            items={items}
            subtotal={subtotal}
            totalShipping={totalShipping}
            total={total}
          />
        )}
      </div>

      {/* ── Barra inferior fija ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-line">
        <div className="max-w-[600px] mx-auto px-4 py-3 flex gap-2.5">
          {step > 1 && (
            <Button
              variant="secondary"
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              icon="arrowLeft"
              disabled={isPending}
            >
              Atrás
            </Button>
          )}

          {step === 1 ? (
            <Button
              full
              size="lg"
              variant="accent"
              iconRight="arrowRight"
              onClick={handleContinue}
              loading={isPending}
              disabled={!addr.street || !addr.number || !addr.zip}
            >
              {isPending ? "Cotizando envío…" : "Continuar"}
            </Button>
          ) : (
            <Button
              full
              size="lg"
              variant="accent"
              onClick={handlePay}
              loading={isPending}
            >
              {isPending ? "Procesando…" : `Pagar ${fmtARS(total)}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
