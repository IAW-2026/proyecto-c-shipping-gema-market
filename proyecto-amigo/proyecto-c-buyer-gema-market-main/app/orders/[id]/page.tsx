import { Suspense } from "react";
import { OrderDetailFetcher } from "@/app/components/features/orders/orderDetail/OrderDetailFetcher";
import { OrderDetailSkeleton } from "@/app/components/features/orders/orderDetail/OrderDetailSkeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailFetcher params={params} />
    </Suspense>
  );
}
