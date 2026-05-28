"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Tag, Home } from "lucide-react";
import type { ShipmentSummary } from "@/lib/definitions/shipments";
import { transitionShipmentAction } from "@/lib/actions/shipment.actions";
import { COURIER_ACTION_MAP } from "@/lib/shared/shipment-constants";
import { formatAddress } from "@/lib/shared/address-utils";
import { CourierHeader } from "./courier-header";
import { CourierMap } from "./courier-map";
import { ChangeStateButton } from "./change-state-button";
import { CancelDialog } from "./cancel-dialog";
import { GoogleMapsLink } from "./google-maps-link";

interface CourierDataProps {
    shipment: ShipmentSummary;
    shipments: ShipmentSummary[];
    selectedTracking: string;
}

export function CourierData({ shipment, shipments, selectedTracking }: CourierDataProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [showCancel, setShowCancel] = useState(false);
    const [hasPendingAction, setHasPendingAction] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const handleAction = useCallback(async (shippingId: string, transition: "pickup" | "transit" | "deliver") => {
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
            setShowCancel(false);
        }
    }, [router]);

    const actionConfig = COURIER_ACTION_MAP[shipment.status];

    return (
        <>
            <CourierHeader
                shipments={shipments}
                selectedTracking={selectedTracking}
                onCancelClick={() => setShowCancel(true)}
                hasPendingAction={hasPendingAction}
                canCancel={!!actionConfig?.canCancel}
            />

            <section className="flex flex-col flex-1 px-4 lgx:px-0">
                <div className="flex-1 relative min-h-0">
                    <CourierMap shipment={shipment} hasPendingAction={hasPendingAction} />
                </div>

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
                            origin={shipment.pickupAddress}
                            destination={shipment.deliveryAddress}
                        />
                    </div>

                    <div className="border-t border-line my-2" />

                    <div className="flex justify-end">
                        <span className="text-base font-bold text-ink">
                            ${shipment.price.toLocaleString("es-AR")}
                        </span>
                    </div>
                </div>

                {actionConfig && (
                    <div className="border-t border-line px-0 pt-4 pb-6 bg-paper">
                        <ChangeStateButton
                            isPending={hasPendingAction}
                            label={actionConfig.label}
                            onClick={() => handleAction(shipment.shippingId, actionConfig.transition)}
                        />
                    </div>
                )}
            </section>

            {mounted && createPortal(
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
