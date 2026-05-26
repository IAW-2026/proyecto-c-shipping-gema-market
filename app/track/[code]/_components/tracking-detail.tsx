import { getShipmentByTrackingCode } from "@/lib/db/queries/shipment";
import { notFound } from "next/navigation";
import { TrackingTimeline } from "./tracking-timeline";
import { MapWrapper } from "./map-wrapper";
import type { Shipment } from "@/lib/definitions/shipments";
import { SHIPMENT_STATUS_LABELS } from "@/lib/shared/shipment-constants";

function formatDateTime(date: Date | null | undefined): string {
    if (!date) return "";
    const d = date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
    const t = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    return `${d} ${t}`;
}

function InfoCard({ shipment }: { shipment: Shipment }) {
    return (
        <div className="bg-paper border border-line rounded-r3 p-5 shadow-sm space-y-4">
            <div className="space-y-3">
                <div>
                    <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Origen</p>
                    <p className="text-sm text-ink mt-0.5">
                        {shipment.pickupAddress.street} {shipment.pickupAddress.number}
                        {shipment.pickupAddress.zip ? `, CP ${shipment.pickupAddress.zip}` : ""}
                        {shipment.pickupAddress.floor ? `, Piso ${shipment.pickupAddress.floor}` : ""}
                        {shipment.pickupAddress.apartment ? `, Dpto ${shipment.pickupAddress.apartment}` : ""}
                    </p>
                </div>
                <div>
                    <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Destino</p>
                    <p className="text-sm text-ink mt-0.5">
                        {shipment.deliveryAddress.street} {shipment.deliveryAddress.number}
                        {shipment.deliveryAddress.zip ? `, CP ${shipment.deliveryAddress.zip}` : ""}
                        {shipment.deliveryAddress.floor ? `, Piso ${shipment.deliveryAddress.floor}` : ""}
                        {shipment.deliveryAddress.apartment ? `, Dpto ${shipment.deliveryAddress.apartment}` : ""}
                    </p>
                </div>
            </div>

            <hr className="border-line" />

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Peso</p>
                    <p className="text-sm text-ink mt-0.5">{shipment.weight} kg</p>
                </div>
                <div>
                    <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Dimensiones</p>
                    <p className="text-sm text-ink mt-0.5">{shipment.height} x {shipment.width} x {shipment.depth} cm</p>
                </div>
                {shipment.distance && (
                    <div>
                        <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Distancia</p>
                        <p className="text-sm text-ink mt-0.5">{shipment.distance.toFixed(1)} km</p>
                    </div>
                )}
                <div>
                    <p className="text-xs font-semibold text-ink-3 uppercase tracking-wide">Creado</p>
                    <p className="text-sm text-ink mt-0.5">{formatDateTime(shipment.createdAt)}</p>
                </div>
            </div>
        </div>
    );
}

export async function TrackingDetail({ trackingCode }: { trackingCode: string }) {
    const shipment = await getShipmentByTrackingCode(trackingCode);

    if (!shipment) notFound();

    return (
        <div className="max-w-7xl mx-auto w-full flex flex-col md:min-h-[calc(100vh-10rem)] gap-6">
            <div className="bg-paper border border-line rounded-r3 p-5 md:p-6 shadow-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
                    <div>
                        <h1 className="text-lg font-bold text-ink">{shipment.trackingCode}</h1>
                        <p className="text-xs text-ink-2 mt-0.5">Codigo de seguimiento</p>
                    </div>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        shipment.status === "delivered"
                            ? "bg-success/15 text-success"
                            : "text-cocoa bg-clay/10"
                    }`}>
                        {SHIPMENT_STATUS_LABELS[shipment.status]}
                    </span>
                </div>

                <TrackingTimeline
                    status={shipment.status}
                    createdAt={shipment.createdAt ?? null}
                    pickedUpAt={shipment.pickedUpAt}
                />
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 min-h-0">
                <div className="bg-paper border border-line rounded-r3 overflow-hidden shadow-sm h-full min-h-[300px] md:min-h-0">
                    <MapWrapper shippingId={shipment.shippingId} />
                </div>
                <InfoCard shipment={shipment} />
            </div>
        </div>
    );
}
