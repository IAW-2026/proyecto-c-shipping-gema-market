"use client";

import { ChangeEvent } from "react";
import { Icon, Pill, Button, Input } from "../../ui";
import type { ProductCondition } from "@/app/lib/types/product";
import { CONDITION_OPTIONS, SORT_OPTIONS } from "./utils/constants";
import type { ParsedFilters } from "./utils/filterParser";
import { fmtARS } from "@/app/lib/utils/format";

interface FiltersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ParsedFilters;
  onFilterChange: (filters: ParsedFilters) => void;
  onApply: () => Promise<void>;
  onClear: () => Promise<void>;
}

/**
 * FiltersPanel - Panel refactorizado con menos props drilling
 *
 * Cambios principales:
 * - Props consolidados en un objeto 'filters'
 * - Una única función callback para actualizar filtros
 * - Lógica de formato separada en utils
 * - Reducido de 10 props a 6
 */
export function FiltersPanel({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onClear,
}: FiltersPanelProps) {
  const handleFilterUpdate = (key: keyof ParsedFilters, value: ParsedFilters[keyof ParsedFilters]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div 
      className={`absolute right-0 top-14 z-[45] w-[360px] bg-paper border border-line rounded-[18px] shadow-sh-3 p-4 origin-top-right max-[640px]:left-0 max-[640px]:right-0 max-[640px]:w-auto transition-all duration-200 ${
        isOpen 
          ? "opacity-100 scale-100 pointer-events-auto" 
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="text-[15px] font-bold text-ink">Filtros</div>
        <button
          onClick={onClose}
          aria-label="Cerrar filtros"
          className="w-8 h-8 rounded-full bg-bone flex items-center justify-center text-ink-3 hover:text-ink transition-colors"
        >
          <Icon name="close" size={15} />
        </button>
      </div>

      {/* Ordenamiento */}
      <label className="grid gap-[7px] mb-3.5">
        <span className="text-xs text-ink-3 font-semibold">Ordenar por</span>
        <select
          value={filters.combinedSort}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            handleFilterUpdate(
              "combinedSort",
              e.target.value as ParsedFilters["combinedSort"],
            )
          }
          className="h-11 w-full bg-cream border border-line rounded-[13px] px-3 text-[13px] text-ink outline-none transition focus:border-line-2"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {/* Condición */}
      <div className="mb-3.5">
        <div className="text-xs text-ink-3 font-semibold mb-2">Condición</div>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(CONDITION_OPTIONS).map(([value, label]) => (
            <Pill
              key={value}
              active={filters.condition === value}
              onClick={() =>
                handleFilterUpdate(
                  "condition",
                  filters.condition === value ? "" : (value as ProductCondition),
                )
              }
              size="md"
            >
              {label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Rango de precio */}
      <label className="grid gap-2 text-xs text-ink-3 mb-4">
        <span className="flex justify-between gap-3 font-semibold">
          Precio máximo
          <span className="font-mono text-ink-2">
            {fmtARS(filters.maxPrice)}
          </span>
        </span>
        <input
          type="range"
          min="0"
          max="1000000"
          step="5000"
          value={filters.maxPrice}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleFilterUpdate("maxPrice", Number(e.target.value))
          }
          aria-label="Precio máximo"
          className="w-full cursor-pointer [accent-color:#333d29]"
        />
        <Input
          icon="cash"
          type="number"
          min="0"
          max="1000000"
          step="5000"
          value={filters.maxPrice}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleFilterUpdate("maxPrice", Number(e.target.value))
          }
        />
      </label>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="h-11 rounded-[13px]"
          onClick={onClear}
        >
          Limpiar
        </Button>
        <Button className="h-11 rounded-[13px]" onClick={onApply}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}
