/**
 * Checkout Page — Server Component.
 *
 * Responsabilidades:
 *  1. Obtener la dirección guardada del usuario desde la BD (para prefill)
 *  2. Montar CheckoutClient con esa dirección inicial
 *
 * El flujo real de negocio (cotización + creación de órdenes) ocurre dentro
 * de CheckoutClient a través de Server Action
 */

import { Suspense } from "react";
import { getAccountData } from "@/app/lib/helpers/account";
import { parseAddress } from "@/app/lib/db/user";
import CheckoutClient from "@/app/components/features/checkout/CheckoutClient";
import CheckoutSkeleton from "@/app/components/features/checkout/CheckoutSkeleton";

async function CheckoutFetcher() {
  const usuario = await getAccountData();
  const savedAddress = usuario ? parseAddress(usuario) : null;

  const initialAddress = {
    street: savedAddress?.street ?? "",
    number: savedAddress?.number ?? "",
    zip: savedAddress?.zip ?? "",
  };

  return <CheckoutClient initialAddress={initialAddress} />;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutFetcher />
    </Suspense>
  );
}
