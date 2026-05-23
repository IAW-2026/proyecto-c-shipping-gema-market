import { Suspense } from "react";
import { TopBar } from "@/app/components/ui";
import FavoritesGrid from "../components/features/favorites/FavoritesGrid";
import FavoritesSkeleton from "../components/features/favorites/FavoritesSkeleton";

export default function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  return (
    <div className="pb-6">
      <TopBar title="Favoritos" back />

      <div className="p-4">
        <Suspense fallback={<FavoritesSkeleton />}>
          <FavoritesGrid searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
