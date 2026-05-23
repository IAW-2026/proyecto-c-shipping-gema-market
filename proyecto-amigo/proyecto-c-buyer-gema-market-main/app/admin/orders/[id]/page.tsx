import { Suspense } from "react";
import { Skeleton } from "@/app/components/ui";
import { OrderDetailContent } from "./_components/OrderDetailContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<AdminOrderDetailSkeleton />}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}

function AdminOrderDetailSkeleton() {
  return (
    <div className="pb-12 max-w-[600px] space-y-4">
      <Skeleton w={120} h={14} r={6} />
      <Skeleton w="60%" h={28} r={8} />
      <Skeleton w="100%" h={72} r={12} />
      <Skeleton w="100%" h={140} r={12} />
      <Skeleton w="100%" h={180} r={12} />
    </div>
  );
}
