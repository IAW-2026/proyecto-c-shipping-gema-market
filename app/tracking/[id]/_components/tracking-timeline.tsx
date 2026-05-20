"use client";

import { Check, Package, Truck, MapPin, Home } from "lucide-react";
import type { ShipmentStatus } from "@/lib/shared/shipment-constants";

const STEPS: { status: ShipmentStatus; label: string; Icon: typeof Package }[] = [
    { status: "waiting_for_courier", label: "En espera de repartidor", Icon: Package },
    { status: "pending_pickup", label: "Repartidor asignado", Icon: MapPin },
    { status: "picked_up", label: "Retirado del vendedor", Icon: Truck },
    { status: "in_transit", label: "En camino", Icon: Truck },
    { status: "delivered", label: "Entregado", Icon: Home },
];

function getStepIndex(currentStatus: ShipmentStatus): number {
    const idx = STEPS.findIndex((s) => s.status === currentStatus);
    return idx >= 0 ? idx : 0;
}

export function TrackingTimeline({ status }: { status: ShipmentStatus }) {
    const currentStep = getStepIndex(status);

    return (
        <div className="flex flex-col gap-0">
            {STEPS.map((step, i) => {
                const isCompleted = i < currentStep;
                const isCurrent = i === currentStep;
                const isPending = i > currentStep;

                return (
                    <div key={step.status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    isCompleted
                                        ? "bg-success"
                                        : isCurrent
                                          ? "bg-clay"
                                          : "bg-bone"
                                }`}
                            >
                                {isCompleted ? (
                                    <Check size={16} className="text-white" />
                                ) : (
                                    <step.Icon
                                        size={16}
                                        className={isCurrent ? "text-white" : "text-ink-3"}
                                    />
                                )}
                            </div>
                            {i < STEPS.length - 1 && (
                                <div
                                    className={`w-0.5 h-8 ${
                                        isCompleted ? "bg-success" : "bg-line"
                                    }`}
                                />
                            )}
                        </div>

                        <div className={`pb-6 ${isPending ? "text-ink-3" : "text-ink"}`}>
                            <span
                                className={`text-sm font-semibold ${
                                    isCurrent ? "text-cocoa" : ""
                                }`}
                            >
                                {step.label}
                            </span>
                            {isCurrent && (
                                <span className="block text-xs text-ink-2 mt-0.5 font-medium">
                                    Estado actual
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
