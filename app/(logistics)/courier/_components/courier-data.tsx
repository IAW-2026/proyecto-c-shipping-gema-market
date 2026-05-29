"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tag, Home } from "lucide-react";
import type { ShipmentSummary } from "@/lib/schemas/domain";
import { transitionShipmentAction } from "@/lib/features/shipment";
import { useConfirmAction } from "@/lib/hooks/use-confirm-action";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { COURIER_ACTION_MAP } from "@/lib/constants/shipment";
import { formatAddress } from "@/lib/utils/address-utils";
import { CourierHeader } from "./courier-header";
import { CourierMap } from "./courier-map";
import { ChangeStateButton } from "./change-state-button";
import { GoogleMapsLink } from "./google-maps-link";

interface CourierDataProps {
    shipment: ShipmentSummary;
    shipments: ShipmentSummary[];
    selectedTracking: string;
}

export function CourierData({ shipment, shipments, selectedTracking }: CourierDataProps) {
    const router = useRouter();
    const [hasPendingAction, setHasPendingAction] = useState(false);

    const { isOpen: showCancel, isPending: isCancelPending, open: openCancel, close: closeCancel, handleConfirm: handleCancel }
        = useConfirmAction(useCallback(() => transitionShipmentAction(shipment.shippingId, "cancel"), [shipment.shippingId]));

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

    const actionConfig = COURIER_ACTION_MAP[shipment.status];

    return (
        <>
            <CourierHeader
                shipments={shipments}
                selectedTracking={selectedTracking}
                onCancelClick={openCancel}
                hasPendingAction={hasPendingAction || isCancelPending}
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

            <ConfirmDialog
                open={showCancel}
                isPending={isCancelPending}
                onConfirm={handleCancel}
                onCancel={closeCancel}
                title="Cancelar misión"
                description="El envío volverá a estar disponible para que otro repartidor lo tome. Esta acción no se puede deshacer."
                confirmLabel="Sí, cancelar"
                variant="danger"
            />
        </>
    );
}
