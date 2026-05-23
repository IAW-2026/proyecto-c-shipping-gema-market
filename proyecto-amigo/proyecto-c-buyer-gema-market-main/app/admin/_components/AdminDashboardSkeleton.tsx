import { Card, Skeleton } from "@/app/components/ui";

export function AdminDashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lgx:grid-cols-4 gap-3.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="h-full">
          <div className="flex items-start justify-between mb-3">
            <Skeleton w={40} h={40} r={12} />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton w={48} h={28} r={6} />
            <Skeleton w={88} h={14} r={6} />
          </div>
        </Card>
      ))}
    </div>
  );
}
