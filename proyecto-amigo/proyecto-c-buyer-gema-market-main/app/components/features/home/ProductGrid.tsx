/**
 * ProductGrid
 *
 * Server Component asíncrono que recibe filtros (derivados de searchParams en
 * page.tsx) y llama a getProducts() para renderizar la grilla.
 *
 * Al estar envuelto en <Suspense>, Next.js hace streaming SSR:
 * muestra ProductGridSkeleton mientras la promesa resuelve.
 */

import type { ProductFilters } from "@/app/lib/types/product";
import { getProducts } from "@/app/lib/api/seller";
import { Pagination } from "@/app/components/ui";
import ProductCard from "../../products/ProductCard";
import { getFavoritosIds } from "@/app/lib/db/favorito";
import { getCurrentUserId } from "@/app/lib/auth/mapClerkId-UserId";

interface ProductGridProps {
  filters: ProductFilters;
}

export default async function ProductGrid({ filters }: ProductGridProps) {
  const [productsResult, favoriteProductIds] = await Promise.all([
    getProducts(filters),
    getCurrentUserId().then((id) => (id ? getFavoritosIds(id) : [])),
  ]);
  const { items, total, page_size } = productsResult;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <svg
          className="h-12 w-12 text-line-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <p className="text-sm font-medium text-ink-3">
          No encontramos productos con esos filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-2 pb-5 lgx:mx-auto lgx:w-full lgx:max-w-295 lgx:px-7 lgx:pt-2 lgx:pb-7">
      <p className="text-xs font-mono text-ink-3">
        {total} {total === 1 ? "resultado" : "resultados"} encontrados
      </p>
      <div
        id="product-grid"
        className="grid gap-3 lgx:gap-4.5 grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lgx:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]"
      >
        {items.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            initialFavorite={favoriteProductIds.includes(product.product_id)}
          />
        ))}
      </div>

      {/* Paginación, se decidio meter aqui el componente Pagination
        debido a que para saber el total de paginas, si o si debemos pedir los productos
        primero, y esto es por como creamos la api de productos
      */}
      <section id="homepage-pagination" className="flex justify-center py-12">
        <Pagination totalPages={Math.ceil(total / page_size)} />
      </section>
    </div>
  );
}
