"use client";

import { useState } from "react";
import { Tabs } from "@/app/components/ui";

interface ProductTabsSectionProps {
  description?: string | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  weight?: number | null;
}

export default function ProductTabsSection({
  description,
  width,
  height,
  depth,
  weight,
}: ProductTabsSectionProps) {
  const [tab, setTab] = useState("descripcion");

  return (
    <div className="mt-8">
      <Tabs
        tabs={[
          { id: "descripcion", label: "Descripción" },
          { id: "especificaciones", label: "Especificaciones" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div
        className="py-5 text-sm text-ink-2 leading-[1.6] min-h-[200px] w-full"
        role="tabpanel"
        id={`tab-panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
      >
        {tab === "descripcion" && (
          <p className="w-full">
            {description || "Sin descripción disponible."}
          </p>
        )}
        {tab === "especificaciones" && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] w-full">
            <div>
              <div className="text-ink-3">Dimensiones</div>
              <div className="font-medium">
                {width}x{height}x{depth}m
              </div>
            </div>
            <div>
              <div className="text-ink-3">Peso</div>
              <div className="font-medium">{weight} kg</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
