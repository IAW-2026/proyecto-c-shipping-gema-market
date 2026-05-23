import { Card, Skeleton } from "@/app/components/ui";

export function UsuarioFormSkeleton() {
  return (
    <>
      <Card padding={20} className="mb-4">
        <div className="flex items-center gap-2.5 mb-[18px]">
          <Skeleton w={36} h={36} r={12} />
          <div className="flex flex-col gap-1.5">
            <Skeleton w={140} h={18} r={6} />
            <Skeleton w={220} h={12} r={6} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 lgx:grid-cols-2 lgx:gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton w={100} h={12} r={4} />
              <Skeleton w="100%" h={44} r={12} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap gap-2.5 justify-between">
        <div className="flex gap-2.5">
          <Skeleton w={92} h={42} r={24} />
          <Skeleton w={108} h={42} r={24} />
        </div>
        <Skeleton w={108} h={42} r={24} />
      </div>
    </>
  );
}
