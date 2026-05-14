"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { transitionShipmentAction } from "@/lib/actions/shipment.actions";
import type { ShipmentSummary } from "@/lib/definitions/shipment";
import { CourierMap } from "./courier-map";
import { ShipmentSelector } from "./shipment-selector";
import { CancelDialog } from "./cancel-dialog";
import { CourierEmpty } from "./courier-empty";
import { Tag, Home, Loader2, Navigation } from "lucide-react";

export function CourierView({ shipments }: { shipments: ShipmentSummary[] }) {
    const router = useRouter();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const [showCancel, setShowCancel] = useState(false);

    if (shipments.length === 0) {
        return <CourierEmpty />;
    }

    const safeIndex = Math.min(selectedIndex, shipments.length - 1);
    const current = shipments[safeIndex];

    const formatAddress = (address: ShipmentSummary["pickupAddress"]) => {
        let base = address.street;
        if (address.number) base += ` ${address.number}`;
        if (address.floor) base += `, Piso ${address.floor}`;
        if (address.apartment) base += `, Depto ${address.apartment}`;
        return base;
    };

    const handleAction = async (transition: "pickup" | "deliver") => {
        setIsPending(true);
        await transitionShipmentAction(current.shippingId, transition);
        setIsPending(false);
        router.refresh();
    };

    const handleCancel = async () => {
        setIsPending(true);
        setShowCancel(false);
        await transitionShipmentAction(current.shippingId, "cancel");
        setIsPending(false);
        router.refresh();
    };

    const isPickup = current.status === "pending_pickup";
    const mainActionLabel = isPickup ? "Recoger paquete" : "Marcar entregado";
    const mainActionTransition = isPickup ? "pickup" : "deliver";

    return (
        <>
            <div className="flex items-center justify-between px-4 py-3 bg-paper border-b border-line shrink-0">
                <ShipmentSelector
                    shipments={shipments}
                    selectedIndex={safeIndex}
                    onSelect={setSelectedIndex}
                />
                <button
                    onClick={() => setShowCancel(true)}
                    disabled={isPending}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50 disabled:opacity-50"
                >
                    Cancelar
                </button>
            </div>

            <div className="flex-1 relative min-h-0">
                <CourierMap shipment={current} />
            </div>

            <div className="bg-paper border-t border-line px-4 pt-4 pb-6 shrink-0 space-y-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-clay text-paper flex items-center justify-center shrink-0 mt-0.5">
                            <Tag size={14} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-ink-2 font-mono uppercase tracking-wider">Retiro</p>
                            <p className="text-sm font-medium text-ink truncate">
                                {formatAddress(current.pickupAddress)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-cocoa text-paper flex items-center justify-center shrink-0 mt-0.5">
                            <Home size={14} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] text-ink-2 font-mono uppercase tracking-wider">Entrega</p>
                            <p className="text-sm font-medium text-ink truncate">
                                {formatAddress(current.deliveryAddress)}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        const toGmaps = (addr: ShipmentSummary["pickupAddress"]) =>
                            `${addr.street}${addr.number ? ` ${addr.number}` : ""}, Bahía Blanca, Argentina`;
                        const origin = encodeURIComponent(toGmaps(current.pickupAddress));
                        const dest = encodeURIComponent(toGmaps(current.deliveryAddress));
                        const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`;
                        window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium text-clay hover:text-cocoa transition-colors py-2"
                >
                    <Navigation size={16} />
                    Abrir en Google Maps
                </button>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-2">Pago</span>
                    <span className="text-lg font-bold text-ink">
                        ${current.price.toLocaleString("es-AR")}
                    </span>
                </div>

                <button
                    onClick={() => handleAction(mainActionTransition as "pickup" | "deliver")}
                    disabled={isPending}
                    className="w-full bg-clay text-paper h-14 rounded-2xl text-base font-bold hover:bg-cocoa transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                    {isPending ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <span>{mainActionLabel}</span>
                    )}
                </button>
            </div>

            <CancelDialog
                open={showCancel}
                isPending={isPending}
                onConfirm={handleCancel}
                onCancel={() => setShowCancel(false)}
            />
        </>
    );
}
