const SKELETON_COUNT = 5;

function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-r3 border border-line bg-paper">
      {/* Imagen */}
      <div className="aspect-square animate-pulse bg-bone" />

      {/* Info */}
      <div className="flex flex-col gap-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-bone" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-bone" />
        <div className="h-5 w-20 animate-pulse rounded bg-bone" />
      </div>
    </div>
  );
}

export default function FavoritesSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(190px,1fr))] max-[420px]:grid-cols-1 lgx:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] lgx:gap-4.5">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
