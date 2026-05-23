import ProductCard from "@/app/components/products/ProductCard";
import { EmptyState, Pagination } from "@/app/components/ui";
import { getFavoritesWithProducts } from "@/app/lib/helpers/favorites";
import { parsePage } from "@/app/lib/utils/pagination";
import { FAVORITES_PAGE_SIZE } from "@/app/lib/constants/pagination";

export default async function FavoritesGrid({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parsePage(pageParam);

  const { items, total } = await getFavoritesWithProducts(page, FAVORITES_PAGE_SIZE);

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon="heart"
        title="Aún no tenés favoritos"
        body="Tocá el corazoncito en cualquier producto."
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / FAVORITES_PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(190px,1fr))] max-[420px]:grid-cols-1 lgx:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] lgx:gap-4.5">
        {items.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            initialFavorite={true}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <section className="flex justify-center py-6">
          <Pagination totalPages={totalPages} />
        </section>
      )}
    </div>
  );
}
