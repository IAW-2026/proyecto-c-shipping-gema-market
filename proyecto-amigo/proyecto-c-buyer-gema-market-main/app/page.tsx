import { Suspense } from "react";
import ProductGrid from "@/app/components/features/home/ProductGrid";
import { buildFiltersFromParams } from "@/app/lib/utils/product-filters";
import ProductGridSkeleton from "@/app/components/products/ProductGridSkeleton";
import { HeaderHomePage } from "@/app/components/features/home/HeaderHomePage";
import { PRODUCTS_PAGE_SIZE } from "@/app/lib/constants/pagination";

/**
 * Home page — Catálogo de productos.
 *
 * Arquitectura de datos:
 *  • La barra de navegación y el footer se renderizan en layout.tsx.
 *  • FilterDrawerServer (Server) carga categorías y monta FilterDrawer (Client).
 *  • FilterDrawer actualiza la URL al aplicar filtros → Next.js re-renderiza
 *    ProductGrid con los nuevos searchParams en una única query a la API/BD.
 *  • ProductGrid está en su propio <Suspense>: muestra skeleton mientras carga,
 *    mientras que el botón y el título ya están visibles (streaming SSR).
 */
interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function ProductGridSection({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const paginatedParams = {
    ...params,
    page: String(page),
    page_size: String(PRODUCTS_PAGE_SIZE),
  };
  const filters = buildFiltersFromParams(paginatedParams);

  return <ProductGrid filters={filters} />;
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <div className="flex-1 w-full">
      {/* == Cabecera ======================================================== */}
      <section id="homepage-header">
        <HeaderHomePage />
      </section>

      {/* == Grilla de Productos ============================================= */}
      <section id="homepage-grid" className="pt-2 pb-8 lgx:pt-3 lgx:pb-7">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGridSection searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
