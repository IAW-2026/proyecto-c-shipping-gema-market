import { TopBar, Skeleton } from "@/app/components/ui";

export function OrderDetailSkeleton() {
  return (
    <div className="pb-12">
      <TopBar back title="…" />
      <div className="p-4 max-w-[600px] mx-auto">
        {/* Status card */}
        <div className="rounded-2xl p-5 mb-4 bg-bone flex flex-col gap-2">
          <Skeleton w={80} h={10} r={4} />
          <Skeleton w={160} h={24} r={6} />
          <Skeleton w={100} h={12} r={4} />
        </div>

        {/* Timeline */}
        <div className="rounded-2xl p-5 mb-4 border border-line bg-paper flex flex-col gap-4">
          <Skeleton w={100} h={14} r={6} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5">
              <Skeleton w={28} h={28} r={14} />
              <Skeleton w={120} h={13} r={5} />
            </div>
          ))}
        </div>

        {/* Product card */}
        <div className="rounded-2xl p-4 border border-line bg-paper flex flex-col gap-3">
          <Skeleton w={90} h={14} r={6} />
          <div className="flex gap-3 items-start">
            <Skeleton w={64} h={64} r={12} />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton w="70%" h={13} r={5} />
              <Skeleton w="50%" h={11} r={4} />
              <Skeleton w={72} h={20} r={10} />
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-3 border-t border-line">
            <div className="flex justify-between">
              <Skeleton w={60} h={12} r={4} />
              <Skeleton w={72} h={12} r={4} />
            </div>
            <div className="flex justify-between">
              <Skeleton w={48} h={12} r={4} />
              <Skeleton w={60} h={12} r={4} />
            </div>
            <div className="flex justify-between pt-2 border-t border-line">
              <Skeleton w={40} h={16} r={4} />
              <Skeleton w={88} h={16} r={4} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
