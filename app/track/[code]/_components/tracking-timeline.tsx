"use client";

import { Check, Package, MapPin, Truck, Home } from "lucide-react";
import type { ShipmentStatus } from "@/lib/shared/shipment-constants";

const STEPS: { status: ShipmentStatus; label: string; Icon: typeof Package }[] = [
    { status: "waiting_for_courier", label: "En espera", Icon: Package },
    { status: "pending_pickup", label: "Repartidor asignado", Icon: MapPin },
    { status: "picked_up", label: "Retirado", Icon: Truck },
    { status: "in_transit", label: "En camino", Icon: Truck },
];

function getStepIndex(currentStatus: ShipmentStatus): number {
    if (currentStatus === "delivered") return STEPS.length;
    const idx = STEPS.findIndex((s) => s.status === currentStatus);
    return idx >= 0 ? idx : 0;
}

function formatDateTime(date: Date | null): string {
    if (!date) return "";
    const d = date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
    const t = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    return `${d} ${t}`;
}

interface TrackingTimelineProps {
    status: ShipmentStatus;
    createdAt: Date | null;
    pickedUpAt: Date | null;
}

function getDateForStep(i: number, createdAt: Date | null, pickedUpAt: Date | null): Date | null {
    if (i === 0) return createdAt;
    if (i === 2) return pickedUpAt;
    return null;
}

export function TrackingTimeline({ status, createdAt, pickedUpAt }: TrackingTimelineProps) {
    const currentStep = getStepIndex(status);

    return (
        <>
            {/* Desktop: horizontal stepper */}
            <div className="hidden md:flex items-start justify-between px-2">
                {STEPS.map((step, i) => {
                    const isCompleted = i < currentStep;
                    const isCurrent = i === currentStep;
                    const isPending = i > currentStep;
                    const date = getDateForStep(i, createdAt, pickedUpAt);

                    return (
                        <div key={step.status} className="flex flex-col items-center flex-1">
                            <div className="flex items-center w-full">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                        isCompleted
                                            ? "bg-success"
                                            : isCurrent
                                              ? "bg-clay"
                                              : "bg-bone"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <Check size={18} className="text-white" />
                                    ) : (
                                        <step.Icon
                                            size={18}
                                            className={isCurrent ? "text-white" : "text-ink-3"}
                                        />
                                    )}
                                </div>
                                {i < STEPS.length && (
                                    <div
                                        className={`flex-1 h-0.5 mx-2 ${
                                            isCompleted ? "bg-success" : "bg-line"
                                        }`}
                                    />
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <span
                                    className={`text-xs font-semibold ${
                                        isCompleted
                                            ? "text-success"
                                            : isCurrent
                                              ? "text-cocoa"
                                              : "text-ink-3"
                                    }`}
                                >
                                    {step.label}
                                </span>
                                {date && (
                                    <p className="text-[11px] text-ink-2 mt-0.5">
                                        {formatDateTime(date)}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* 5to circulo — entregado, sin label */}
                <div className="flex flex-col items-center">
                    <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            status === "delivered" ? "bg-success" : "bg-bone"
                        }`}
                    >
                        {status === "delivered" ? (
                            <Check size={18} className="text-white" />
                        ) : (
                            <Home size={18} className="text-ink-3" />
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile: vertical timeline */}
            <div className="flex md:hidden flex-col gap-0">
                {STEPS.map((step, i) => {
                    const isCompleted = i < currentStep;
                    const isCurrent = i === currentStep;
                    const isPending = i > currentStep;
                    const date = getDateForStep(i, createdAt, pickedUpAt);

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
                                {date && (
                                    <p className="text-xs text-ink-2 mt-0.5">{formatDateTime(date)}</p>
                                )}
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
        </>
    );
}
