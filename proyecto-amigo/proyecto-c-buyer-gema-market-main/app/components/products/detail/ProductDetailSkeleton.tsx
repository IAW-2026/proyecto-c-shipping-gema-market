import { Skeleton } from "@/app/components/ui";

export function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col lgx:grid lgx:grid-cols-[minmax(360px,500px)_minmax(0,1fr)] lgx:gap-8 lgx:items-start lgx:max-w-[1180px] lgx:mx-auto">
      {/* Galería */}
      <div className="lgx:sticky lgx:top-6">
        <div className="aspect-square max-h-130 relative min-[600px]:max-w-140 min-[600px]:mx-auto min-[600px]:rounded-r3 min-[600px]:overflow-hidden min-[600px]:border min-[600px]:border-line lgx:max-w-none lgx:rounded-r3 lgx:overflow-hidden lgx:border lgx:border-line lgx:shadow-sh-1 bg-bone">
          <Skeleton w="100%" h="100%" r={0} />
        </div>
      </div>

      {/* Columna derecha */}
      <div className="px-4 py-5 min-[600px]:max-w-[680px] min-[600px]:mx-auto lgx:max-w-none lgx:p-0 w-full min-w-0">
        {/* Info */}
        <div className="w-full">
          <div className="mb-2">
            <Skeleton w={60} h={22} r={11} />
          </div>
          <div className="mb-2">
            <Skeleton w="70%" h={28} r={6} />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Skeleton w={100} h={13} r={4} />
          </div>
          <div className="flex items-baseline gap-3 mb-4">
            <Skeleton w={160} h={32} r={6} />
          </div>
        </div>

        {/* Cart actions */}
        <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-line px-4 py-3 flex gap-2.5 z-50 max-w-150 mx-auto lgx:static lgx:max-w-none lgx:bg-transparent lgx:backdrop-blur-none lgx:border-t lgx:border-line lgx:px-0 lgx:pt-4 lgx:pb-0 lgx:mt-5">
          <Skeleton w={144} h={48} r={24} />
          <div className="flex-1">
            <Skeleton w="100%" h={48} r={24} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex gap-2 mb-4">
            <Skeleton w={110} h={36} r={10} />
            <Skeleton w={140} h={36} r={10} />
          </div>
          <div className="py-5 flex flex-col gap-2 min-h-[200px]">
            <Skeleton w="100%" h={14} r={4} />
            <Skeleton w="95%" h={14} r={4} />
            <Skeleton w="88%" h={14} r={4} />
            <Skeleton w="60%" h={14} r={4} />
          </div>
        </div>
      </div>
    </div>
  );
}
