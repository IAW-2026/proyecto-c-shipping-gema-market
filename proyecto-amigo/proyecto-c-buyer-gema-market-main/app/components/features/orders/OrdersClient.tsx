"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, EmptyState, Pagination } from "@/app/components/ui";
import { OrderCard } from "./OrderCard";
import { OrdersSkeleton } from "./OrdersSkeleton";
import type { OrderForUI } from "@/app/lib/types/orders";

interface OrdersClientProps {
  orders: OrderForUI[];
  activeCount: number;
  historialCount: number;
  currentTab: "activos" | "historial";
  totalPages: number;
}

export default function OrdersClient({
  orders,
  activeCount,
  historialCount,
  currentTab,
  totalPages,
}: OrdersClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isPending) return <OrdersSkeleton />;

  return (
    <div className="pb-6">
      <div className="px-4">
        <Tabs
          tabs={[
            { id: "activos", label: "Activos", count: activeCount },
            { id: "historial", label: "Historial", count: historialCount },
          ]}
          active={currentTab}
          onChange={(t) =>
            startTransition(() => router.push(`/orders?tab=${t}&page=1`))
          }
        />
      </div>

      <div
        role="tabpanel"
        id={`tab-panel-${currentTab}`}
        aria-labelledby={`tab-${currentTab}`}
        className="p-4 flex flex-col gap-3"
      >
        {orders.length === 0 ? (
          <EmptyState
            icon="box"
            title="Sin pedidos por ahora"
            body={
              currentTab === "activos"
                ? "Cuando hagas una compra aparece acá."
                : "Tu historial está vacío."
            }
          />
        ) : (
          orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              href={`/orders/${o.id}`}
            />
          ))
        )}

        {totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
