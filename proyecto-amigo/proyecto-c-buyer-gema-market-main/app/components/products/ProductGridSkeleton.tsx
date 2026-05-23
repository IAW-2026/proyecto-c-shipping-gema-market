/**
 * ProductGridSkeleton
 *
 * Placeholder animado que se muestra mientras se resuelve la promesa de
 * carga de productos. Se usa como `fallback` del <Suspense> en page.tsx.
 */
import { PRODUCTS_PAGE_SIZE } from "@/app/lib/constants/pagination";

const SKELETON_COUNT = PRODUCTS_PAGE_SIZE;

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-r3 border border-line bg-paper shadow-sh-1">
      {/* imagen */}
      <div className="aspect-square animate-pulse bg-bone" />
      {/* info */}
      <div className="flex flex-col gap-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-bone" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-bone" />
        <div className="h-4 w-3/5 animate-pulse rounded bg-bone" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-5 w-20 animate-pulse rounded bg-bone" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-bone" />
        </div>
      </div>
    </div>
  );
}

export default function ProductGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando productos..."
      className="flex flex-col gap-4 px-4 pt-2 pb-5 lgx:mx-auto lgx:w-full lgx:max-w-295 lgx:px-7 lgx:pt-2 lgx:pb-7"
    >
      <div className="h-3.5 w-40 animate-pulse rounded bg-bone" />

      <div className="grid gap-3 lgx:gap-4.5 grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lgx:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <div className="mt-2 flex justify-center py-8">
        <div className="h-9 w-56 animate-pulse rounded-r2 bg-bone" />
      </div>
    </div>
  );
}
