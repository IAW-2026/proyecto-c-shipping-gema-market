"use client";

import { useState, useRef, useEffect } from "react";
import { Icon, SearchBar } from "../../ui";

import { FiltersPanel } from "./FiltersPanel";
import { useFilteredParams } from "./hooks/useFilteredParams";
import { useApplyFilters, useClearFilters } from "./hooks/useApplyFilters";
import type { ParsedFilters } from "./utils/filterParser";

/**
 * SearchFilters - Componente refactorizado que gestiona filtrado, búsqueda y ordenamiento
 *
 * Cambios principales:
 * - URL como única fuente de verdad (no duplica estado)
 * - Lógica separada en hooks y utils reutilizables
 * - Menos renders y mejor performance
 * - Type safety mejorado con validadores
 */
export default function SearchFilters() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Leer filtros directamente de la URL (sin duplicar en useState)
  const urlFilters = useFilteredParams();

  // Estado local para ediciones pendientes (mientras el modal está abierto)
  const [pendingFilters, setPendingFilters] =
    useState<ParsedFilters>(urlFilters);

  // Hooks para aplicar y limpiar filtros
  const applyFilters = useApplyFilters();
  const clearFilters = useClearFilters();

  // Sincronizar filtros pendientes cuando cambia la URL
  // Esto permite que el modal refleje los filtros aplicados desde la URL
  const [prevUrlFilters, setPrevUrlFilters] = useState(urlFilters);
  if (urlFilters !== prevUrlFilters) {
    setPendingFilters(urlFilters);
    setPrevUrlFilters(urlFilters);
  }

  // Manejar click fuera del panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleApply = async () => {
    const success = await applyFilters(pendingFilters);
    if (success) {
      setIsOpen(false);
    }
  };

  const handleClear = async () => {
    await clearFilters(pendingFilters.searchQuery);
    setIsOpen(false);
  };

  // Contar filtros activos desde la URL
  const activeFilterCount =
    (urlFilters.combinedSort ? 1 : 0) +
    (urlFilters.condition ? 1 : 0) +
    (urlFilters.maxPrice < 1000000 ? 1 : 0);

  return (
    <div
      className="lgx:max-w-[1180px] lgx:mx-auto lgx:w-full"
      ref={containerRef}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2.5 items-center mb-3 relative max-[640px]:grid-cols-[minmax(0,1fr)_auto]">
        {/* Barra de búsqueda */}
        <SearchBar
          className="flex-1"
          label="Buscar productos"
          submitLabel="Buscar"
          placeholder="Buscar muebles, cocina, deco..."
          value={pendingFilters.searchQuery}
          onChange={(searchQuery) =>
            setPendingFilters((prev) => ({ ...prev, searchQuery }))
          }
          onSubmit={() => applyFilters(pendingFilters)}
        />

        {/* Botón de filtros */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Filtros"
          className={`h-[46px] rounded-r2 border border-line-2 px-3.5 inline-flex items-center gap-2 text-ink text-[13px] font-semibold whitespace-nowrap transition-all max-[640px]:px-3 ${
            isOpen ? "bg-bone border-ink" : "bg-paper hover:bg-bone"
          }`}
        >
          <Icon name="sliders" size={17} />
          <span className="max-[640px]:hidden">Filtros</span>
          {activeFilterCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-forest text-paper inline-flex items-center justify-center text-[11px]">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Panel de filtros */}
        <FiltersPanel
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          filters={pendingFilters}
          onFilterChange={setPendingFilters}
          onApply={handleApply}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}
