import { Suspense } from "react";
import Link from "next/link";
import { Icon, Logo } from "../../ui";
import CategoryListFetcher from "@/app/components/features/home/CategoryListFetcher";
import SearchFilters from "./SearchFilters";

export function HeaderHomePage() {
  return (
    <div className="sticky top-0 z-30 bg-paper/90 backdrop-blur-md px-4 pt-3 border-b border-line lgx:px-7">
      {/* H1 oculto para accesibilidad y SEO */}
      <h1 className="sr-only">UniHousing — Tu mudanza simplificada</h1>
      
      {/* Cabecera (Logo + Botón de carrito) */}
      <div className="mb-3 flex w-full items-center gap-3 lgx:mx-auto lgx:max-w-295">
        <Link href="/" className="inline-flex items-center" aria-label="Ir al inicio">
          <Logo size={22} />
        </Link>
        <div className="flex-1" />
        <Link
          href="/cart"
          className=" w-9.5 h-9.5 rounded-full bg-bone flex items-center justify-center relative"
          aria-label="Ver carrito"
        >
          <Icon name="cart" size={18} />
          {/* TODO: mostrar cantidad de productos en el carrito */}
          {/* <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1.5 rounded-full bg-forest text-paper text-[10px] font-bold flex items-center justify-center">
            0
          </span> */}
        </Link>
      </div>

      {/* Barra de búsqueda y botón de filtros (Integrados) */}
      <Suspense
        fallback={
          <div className="lgx:mx-auto lgx:w-full lgx:max-w-295">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2.5 items-center mb-3 relative max-[640px]:grid-cols-[minmax(0,1fr)_auto]">
              <div className="h-11.5 w-full animate-pulse rounded-r2 bg-bone" />
              <div className="h-11.5 w-27 animate-pulse rounded-r2 bg-bone max-[640px]:w-11.5" />
            </div>
          </div>
        }
      >
        <SearchFilters />
      </Suspense>

      {/* Carrusel Categorías */}
      <Suspense
        fallback={
          <div className="overflow-x-auto -mx-4 no-scrollbar">
            <div className="flex w-max gap-1.5 px-4 pb-3 lgx:mx-auto lgx:w-full lgx:max-w-295">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-20 animate-pulse rounded-full bg-bone"
                />
              ))}
            </div>
          </div>
        }
      >
        <CategoryListFetcher />
      </Suspense>
    </div>
  );
}
