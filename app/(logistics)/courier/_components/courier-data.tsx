"use client";

import { useState, useCallback, ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Tag, Home } from "lucide-react";
import type { ShipmentSummary } from "@/lib/definitions/shipment";
import { transitionShipmentAction } from "@/lib/actions/shipment.actions";
import { CourierHeader } from "./courier-header";
import { CourierMap } from "./courier-map";
import { ChangeStateButton } from "./courier-actions";
import { CancelDialog } from "./cancel-dialog";

interface CourierDataProps {
    shipment: ShipmentSummary;
    shipments: ShipmentSummary[];
    selectedTracking: string;
}

export function CourierData({ shipment, shipments, selectedTracking }: CourierDataProps) {
    const router = useRouter();
    const [showCancel, setShowCancel] = useState(false);
    const [hasPendingAction, setHasPendingAction] = useState(false);

    const handleAction = useCallback(async (shippingId: string, transition: "pickup" | "deliver") => {
        setHasPendingAction(true);
        try {
            const result = await transitionShipmentAction(shippingId, transition);
            if (!result.success) console.error(result.error);
        } catch (error) {
            console.error("Error al ejecutar acción:", error);
        } finally {
            router.refresh();
            setHasPendingAction(false);
        }
    }, [router]);

    const handleCancel = useCallback(async (shippingId: string) => {
        setHasPendingAction(true);
        try {
            const result = await transitionShipmentAction(shippingId, "cancel");
            if (!result.success) console.error(result.error);
        } catch (error) {
            console.error("Error al cancelar:", error);
        } finally {
            router.refresh();
            setHasPendingAction(false);
        }
    }, [router]);

    const formatGmaps = (address: ShipmentSummary["pickupAddress"]) =>
        `${address.street}${address.number ? ` ${address.number}` : ""}, Bahía Blanca, Argentina`;

    const formatAddress = (address: ShipmentSummary["pickupAddress"]) => {
        let base = address.street;
        if (address.number) base += ` ${address.number}`;
        if (address.floor) base += `, Piso ${address.floor}`;
        if (address.apartment) base += `, Depto ${address.apartment}`;
        return base;
    };

    const isPickup = shipment.status === "pending_pickup";
    const mainActionLabel = isPickup ? "Recoger paquete" : "Marcar entregado";
    const mainActionTransition: "pickup" | "deliver" = isPickup ? "pickup" : "deliver";

    return (
        <>
            <CourierHeader
                shipments={shipments}
                selectedTracking={selectedTracking}
                onCancelClick={() => setShowCancel(true)}
                hasPendingAction={hasPendingAction}
            />

            <section className="flex flex-col flex-1 px-4 lgx:px-0">
                <CourierMapArea>
                    <CourierMap shipment={shipment} hasPendingAction={hasPendingAction} />
                </CourierMapArea>

                <div className="px-4 py-2 bg-paper border-t border-line">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                                <Tag size={14} className="shrink-0 text-clay" />
                                <span className="text-ink font-medium truncate">{formatAddress(shipment.pickupAddress)}</span>
                            </div>

                            <div className="flex-1 border-t border-dashed border-ink-2 min-w-[12px]" />

                            <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                                <Home size={14} className="shrink-0 text-cocoa" />
                                <span className="text-ink font-medium truncate">{formatAddress(shipment.deliveryAddress)}</span>
                            </div>
                        </div>

                        <GoogleMapsLink
                            origin={formatGmaps(shipment.pickupAddress)}
                            destination={formatGmaps(shipment.deliveryAddress)}
                        />
                    </div>

                    <div className="border-t border-line my-2" />

                    <div className="flex justify-end">
                        <span className="text-base font-bold text-ink">
                            ${shipment.price.toLocaleString("es-AR")}
                        </span>
                    </div>
                </div>

                <div className="border-t border-line px-0 pt-4 pb-6 bg-paper">
                    <ChangeStateButton
                        isPending={hasPendingAction}
                        label={mainActionLabel}
                        onClick={() => handleAction(shipment.shippingId, mainActionTransition)}
                    />
                </div>
            </section>

            {typeof window !== "undefined" && createPortal(
                <CancelDialog
                    open={showCancel}
                    hasPendingAction={hasPendingAction}
                    onConfirm={() => handleCancel(shipment.shippingId)}
                    onCancel={() => setShowCancel(false)}
                />,
                document.body
            )}
        </>
    );
}

// --- Layout helpers ---

function CourierMapArea({ children }: { children: ReactNode }) {
    return <div className="flex-1 relative min-h-0">{children}</div>;
}

function GoogleMapsLink({ origin, destination }: { origin: string; destination: string }) {
    const handleClick = () => {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <button
            onClick={handleClick}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shrink-0 transition-colors shadow-sm"
            title="Abrir en Google Maps"
        >
            <img src="/images/google_maps_icon.png" alt="Google Maps" className="w-5 h-5" />
        </button>
    );
}


