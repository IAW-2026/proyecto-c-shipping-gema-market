"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Repeat, BarChart3, Users, Package, Globe, Gamepad2, Radio } from "lucide-react";

const STORAGE_KEY = "dev-testing-checklist";

interface ChecklistItem {
    id: string;
    label: string;
}

interface ChecklistSection {
    id: string;
    title: string;
    icon: typeof Repeat;
    items: ChecklistItem[];
}

const SECTIONS: ChecklistSection[] = [
    {
        id: "flow-cycle",
        title: "Ciclo completo de un envio",
        icon: Repeat,
        items: [
            { id: "fc-1", label: "Ir a Por tomar y tomar un envío en espera" },
            { id: "fc-2", label: "Ir a Modo repartidor - Click \"Recoger paquete\"" },
            { id: "fc-3", label: "Ir a Modo repartidor - Click \"Iniciar viaje\"" },
            { id: "fc-4", label: "Ir a Modo repartidor - Click \"Marcar entregado\"" },
            { id: "fc-5", label: "Ver en Historial que el envío aparece" },
            { id: "fc-6", label: "Ver en Liquidaciones la liquidación semanal" },
            { id: "fc-7", label: "Ir a Consola - Ver las notificaciones enviadas" },
        ],
    },
    {
        id: "flow-dashboard",
        title: "Dashboard y rendimiento",
        icon: BarChart3,
        items: [
            { id: "fd-1", label: "Ver metricas del dia (envios entregados, ganancias, distancia)" },
            { id: "fd-2", label: "Ver lista de envios activos" },
            { id: "fd-3", label: "Ver grafico de rendimiento semanal (ultimas 6 semanas)" },
            { id: "fd-4", label: "Ver comparacion con semana anterior (% cambio)" },
        ],
    },
    {
        id: "flow-drivers",
        title: "Gestion de drivers",
        icon: Users,
        items: [
            { id: "fdr-1", label: "Ver lista de todos los drivers" },
            { id: "fdr-2", label: "Ver detalle de un driver con su historial de envios" },
            { id: "fdr-3", label: "Banear un driver (Logistics Operator)" },
            { id: "fdr-4", label: "Ver que el driver baneado no puede tomar envios" },
            { id: "fdr-5", label: "Desbanear un driver" },
            { id: "fdr-6", label: "Eliminar un driver (Ana Torres) con reasignacion de envios" },
        ],
    },
    {
        id: "flow-shipments",
        title: "Gestion de envios",
        icon: Package,
        items: [
            { id: "fs-1", label: "Ver todos los envios con filtros por estado" },
            { id: "fs-2", label: "Editar precio de un envío en espera" },
            { id: "fs-3", label: "Desvincular repartidor de un envío pendiente de retiro" },
            { id: "fs-4", label: "Eliminar un envio" },
        ],
    },
    {
        id: "flow-tracking",
        title: "Tracking publico",
        icon: Globe,
        items: [
            { id: "ft-1", label: "Ir a /track/BB-000001-2026 - Ver entregado con ruta en mapa" },
            { id: "ft-2", label: "Ir a /track/BB-000002-2026 - Ver en transito" },
            { id: "ft-3", label: "Ir a /track/BB-000003-2026 - Ver pendiente de retiro" },
        ],
    },
    {
        id: "flow-playground",
        title: "API Playground",
        icon: Gamepad2,
        items: [
            { id: "fp-1", label: "Configurar direccion de origen y destino" },
            { id: "fp-2", label: "Cotizar un envio" },
            { id: "fp-3", label: "Reservar la cotizacion" },
            { id: "fp-4", label: "Crear el envio" },
            { id: "fp-5", label: "Ver el trafico en el log" },
        ],
    },
    {
        id: "flow-console",
        title: "Consola de notificaciones",
        icon: Radio,
        items: [
            { id: "fco-1", label: "Ver notificaciones enviadas a Seller" },
            { id: "fco-2", label: "Ver notificaciones enviadas a Buyer" },
            { id: "fco-3", label: "Ver llamadas API mock (origen vendedor, datos comprador)" },
            { id: "fco-4", label: "Filtrar por tipo (Seller/Buyer/API)" },
            { id: "fco-5", label: "Limpiar consola" },
        ],
    },
];

function loadChecked(): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        return new Set(JSON.parse(raw) as string[]);
    } catch {
        return new Set();
    }
}

function saveChecked(checked: Set<string>) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
}

function SectionAccordion({ section, checked, onToggle }: {
    section: ChecklistSection;
    checked: Set<string>;
    onToggle: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const sectionChecked = section.items.filter((i) => checked.has(i.id)).length;
    const allDone = sectionChecked === section.items.length;
    const Icon = section.icon;

    return (
        <div className="border border-line rounded-r2 overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cream/50 transition-colors text-left"
            >
                <Icon size={18} className="text-ink-3 shrink-0" />
                <span className="text-sm font-semibold text-ink flex-1">{section.title}</span>
                <span className="text-[11px] text-ink-3 font-mono">
                    {sectionChecked}/{section.items.length}
                </span>
                {allDone && <span className="text-xs text-success font-semibold">OK</span>}
                {open ? <ChevronUp size={16} className="text-ink-3" /> : <ChevronDown size={16} className="text-ink-3" />}
            </button>

            {open && (
                <div className="px-4 pb-3 border-t border-line divide-y divide-line">
                    {section.items.map((item, idx) => (
                        <label
                            key={item.id}
                            className="flex items-start gap-3 py-2.5 cursor-pointer group"
                        >
                            <input
                                type="checkbox"
                                checked={checked.has(item.id)}
                                onChange={() => onToggle(item.id)}
                                className="mt-0.5 w-4 h-4 rounded border-line text-clay focus:ring-clay focus:ring-offset-0 cursor-pointer"
                            />
                            <span className={`text-sm leading-snug transition-colors ${
                                checked.has(item.id) ? "text-ink-3 line-through" : "text-ink-2 group-hover:text-ink"
                            }`}>
                                <span className="text-ink-3 mr-1.5 font-mono text-xs">{idx + 1}.</span>
                                {item.label}
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

export function TestingChecklist() {
    const [checked, setChecked] = useState<Set<string>>(new Set());

    useEffect(() => {
        setChecked(loadChecked());
    }, []);

    const handleToggle = (id: string) => {
        const next = new Set(checked);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setChecked(next);
        saveChecked(next);
    };

    const totalChecked = checked.size;
    const totalItems = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

    return (
        <div className="bg-paper border border-line rounded-r3 overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink">Flujos de Testing</h3>
                <span className="text-[11px] text-ink-3 font-mono">
                    {totalChecked}/{totalItems} completados
                </span>
            </div>

            <div className="p-5 space-y-3">
                {SECTIONS.map((section) => (
                    <SectionAccordion
                        key={section.id}
                        section={section}
                        checked={checked}
                        onToggle={handleToggle}
                    />
                ))}
            </div>
        </div>
    );
}
