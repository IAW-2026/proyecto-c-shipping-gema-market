// app/(operator)/_components/shipment-status-badge.tsx
import { ShippingStatus } from "@/lib/definitions/shipment";

interface ShipmentStatusBadgeProps {
    status: ShippingStatus;
    className?: string; // Permite inyectar márgenes o posicionamiento desde el padre
}

export function ShipmentStatusBadge({ status, className = '' }: ShipmentStatusBadgeProps) {
    // 1. Mapeo de reglas de negocio a estilos visuales (Tailwind)
    const statusConfig: Record<ShippingStatus, { label: string; style: string }> = {
        pending_pickup: {
            label: "Pendiente",
            style: "bg-gray-100 text-gray-800 border-gray-200"
        },
        in_transit: {
            label: "En Camino",
            style: "bg-yellow-100 text-yellow-800 border-yellow-200"
        },
        delivered: {
            label: "Entregado",
            style: "bg-green-100 text-green-800 border-green-200"
        },
        failed: {
            label: "Fallido",
            style: "bg-red-100 text-red-800 border-red-200"
        },
        cancelled: {
            label: "Cancelado",
            style: "bg-zinc-100 text-zinc-600 border-zinc-200"
        },
    };

    // Fallback seguro por si la base de datos devuelve un estado anómalo
    const config = statusConfig[status] || {
        label: "Desconocido",
        style: "bg-gray-100 text-gray-500 border-gray-200"
    };

    // 2. Renderizado del componente
    return (
        <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider inline-flex items-center justify-center border ${config.style} ${className}`}
        >
            {config.label}
        </span>
    );
}