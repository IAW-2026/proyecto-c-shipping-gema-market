"use client";

import { Check, Package, MapPin, Truck, Navigation, Home } from "lucide-react";
import type { ShipmentStatus } from "@/lib/shared/shipment-constants";

interface TrackingTimelineProps {
    status: ShipmentStatus;
    createdAt: Date | null;
    pickedUpAt: Date | null;
    deliveredAt: Date | null;
}

interface StepDef {
    status: ShipmentStatus;
    label: string;
    Icon: typeof Package;
    getDate: (props: TrackingTimelineProps) => Date | null;
}

const STEPS: StepDef[] = [
    { status: "waiting_for_courier", label: "En espera", Icon: Package, getDate: (p) => p.createdAt },
    { status: "pending_pickup", label: "Asignado", Icon: MapPin, getDate: () => null },
    { status: "picked_up", label: "Retirado", Icon: Truck, getDate: (p) => p.pickedUpAt },
    { status: "in_transit", label: "En camino", Icon: Navigation, getDate: () => null },
    { status: "delivered", label: "Entregado", Icon: Home, getDate: (p) => p.deliveredAt },
];

function getStepIndex(currentStatus: ShipmentStatus): number {
    return STEPS.findIndex((s) => s.status === currentStatus);
}

function formatDate(date: Date | null): string {
    if (!date) return "\u2014";
    const d = date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
    const t = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    return `${d} ${t}`;
}

function StepCircle({ step, isCompleted, isCurrent }: { step: StepDef; isCompleted: boolean; isCurrent: boolean }) {
    return (
        <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                isCompleted || isCurrent ? "bg-success" : "bg-bone"
            }`}
        >
            {isCompleted ? (
                <Check size={18} className="text-white" />
            ) : isCurrent ? (
                <div className="w-2.5 h-2.5 bg-white rounded-full" />
            ) : (
                <step.Icon size={18} className="text-ink-3" />
            )}
        </div>
    );
}

function StepLabel({ isCompleted, isCurrent, children }: { isCompleted: boolean; isCurrent: boolean; children: React.ReactNode }) {
    return (
        <p className={`text-xs font-semibold truncate ${
            isCompleted ? "text-ink" : isCurrent ? "text-ink font-bold" : "text-ink-3"
        }`}>
            {children}
        </p>
    );
}

function StepDate({ isCompleted, isCurrent, children }: { isCompleted: boolean; isCurrent: boolean; children: React.ReactNode }) {
    return (
        <p className={`text-[11px] mt-0.5 ${
            isCompleted || isCurrent ? "text-ink-2" : "text-ink-3"
        }`}>
            {children}
        </p>
    );
}

export function TrackingTimeline({ status, createdAt, pickedUpAt, deliveredAt }: TrackingTimelineProps) {
    const currentStep = getStepIndex(status);
    const props = { status, createdAt, pickedUpAt, deliveredAt };

    return (
        <>
            {/* Desktop: horizontal stepper */}
            <div className="hidden md:flex items-start justify-between">
                {STEPS.map((step, i) => {
                    const isCompleted = i < currentStep;
                    const isCurrent = i === currentStep;
                    const isPending = i > currentStep;
                    const date = step.getDate(props);

                    return (
                        <div key={step.status} className="flex flex-col items-center flex-1 min-w-0">
                            <div className="relative w-full flex justify-center">
                                {i > 0 && (
                                    <div
                                        className={`absolute top-1/2 -translate-y-1/2 h-0.5 ${
                                            i - 1 < currentStep ? "bg-success" : "bg-line"
                                        }`}
                                        style={{ left: 0, width: "calc(50% - 18px)" }}
                                    />
                                )}
                                {i < STEPS.length - 1 && (
                                    <div
                                        className={`absolute top-1/2 -translate-y-1/2 h-0.5 ${
                                            isCompleted ? "bg-success" : "bg-line"
                                        }`}
                                        style={{ right: 0, width: "calc(50% - 18px)" }}
                                    />
                                )}
                                <StepCircle step={step} isCompleted={isCompleted} isCurrent={isCurrent} />
                            </div>
                            <div className="mt-2 text-center w-full">
                                <StepLabel isCompleted={isCompleted} isCurrent={isCurrent}>
                                    {step.label}
                                </StepLabel>
                                <StepDate isCompleted={isCompleted} isCurrent={isCurrent}>
                                    {formatDate(date)}
                                </StepDate>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile: vertical timeline */}
            <div className="flex md:hidden flex-col gap-0">
                {STEPS.map((step, i) => {
                    const isCompleted = i < currentStep;
                    const isCurrent = i === currentStep;
                    const isPending = i > currentStep;
                    const date = step.getDate(props);

                    return (
                        <div key={step.status} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <StepCircle step={step} isCompleted={isCompleted} isCurrent={isCurrent} />
                                {i < STEPS.length - 1 && (
                                    <div className={`w-0.5 h-8 ${isCompleted ? "bg-success" : "bg-line"}`} />
                                )}
                            </div>
                            <div className={`pb-6 ${isPending ? "text-ink-3" : "text-ink"}`}>
                                <StepLabel isCompleted={isCompleted} isCurrent={isCurrent}>
                                    {step.label}
                                </StepLabel>
                                <StepDate isCompleted={isCompleted} isCurrent={isCurrent}>
                                    {formatDate(date)}
                                </StepDate>
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
