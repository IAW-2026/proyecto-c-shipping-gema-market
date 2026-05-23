import { Card, Skeleton } from "@/app/components/ui";

export default function AccountSkeleton() {
  return (
    <div className="p-4 min-[600px]:max-w-[760px] min-[600px]:mx-auto min-[600px]:p-6 lgx:max-w-[760px] lgx:mx-auto lgx:p-0">
      {/* Avatar card */}
      <Card padding={20} className="mb-4">
        <div className="flex items-center gap-3.5">
          <Skeleton w={64} h={64} r={32} />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton w="50%" h={20} r={6} />
            <Skeleton w="70%" h={14} r={6} />
          </div>
        </div>
      </Card>

      {/* Form card */}
      <Card padding={20}>
        {/* Section header */}
        <div className="flex items-center gap-2.5 mb-[18px]">
          <Skeleton w={36} h={36} r={12} />
          <div className="flex flex-col gap-1.5">
            <Skeleton w={160} h={18} r={6} />
            <Skeleton w={220} h={12} r={6} />
          </div>
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-1 gap-3.5 min-[600px]:grid-cols-2 lgx:grid-cols-2 lgx:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton w={100} h={12} r={4} />
              <Skeleton w="100%" h={44} r={12} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
