import { Suspense } from "react";
import { TopBar } from "@/app/components/ui";
import { OrdersFetcher } from "@/app/components/features/orders/OrdersFetcher";
import { OrdersSkeleton } from "@/app/components/features/orders/OrdersSkeleton";

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; tab?: string | string[] }>;
}) {
  return (
    <>
      <TopBar title="Mis pedidos" back />
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersFetcher searchParams={searchParams} />
      </Suspense>
    </>
  );
}
