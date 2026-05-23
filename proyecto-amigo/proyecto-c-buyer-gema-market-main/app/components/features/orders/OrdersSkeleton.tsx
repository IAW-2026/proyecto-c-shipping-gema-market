import { Skeleton } from "@/app/components/ui";

function OrderCardSkeleton() {
  return (
    <div className="bg-paper rounded-2xl p-4 border border-line flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <Skeleton w={140} h={12} r={6} />
        <Skeleton w={72} h={20} r={10} />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton w={48} h={48} r={8} />
        <Skeleton w="60%" h={14} r={6} />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1.5">
          <Skeleton w={80} h={11} r={5} />
          <Skeleton w={96} h={16} r={6} />
        </div>
        <Skeleton w={18} h={18} r={4} />
      </div>
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="pb-6">
      <div className="px-4 mb-4">
        <Skeleton w="100%" h={40} r={12} />
      </div>
      <div className="px-4 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <OrderCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
