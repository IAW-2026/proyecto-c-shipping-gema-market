import React from "react";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { WeightTag, TimeTag, DistanceTag } from "./available-shipment-tags";
import { ShipmentOffer } from "@/lib/definitions/shipments";
import { ViewDetailsButton, TakeShipmentButton } from "./available-actions";

interface ShipmentCardProps {
    offer: ShipmentOffer;
}

export function AvailableShipmentCard({ offer }: ShipmentCardProps) {
    return (
        <Card className="p-5 flex flex-col gap-5 bg-paper">
            <Cabecera offer={offer} />
            <Cuerpo offer={offer} />
            <Pie offer={offer} />
        </Card>
    );
}

function Cabecera({ offer }: { offer: ShipmentOffer }) {
    return (
        <div className="flex justify-between items-start">
            <div>
                <span className="text-[12px] font-mono  text-ink-3 uppercase tracking-wider block mb-1">
                    {offer.shippingId}
                </span>
                <span className="font-sans text-sm font-semibold text-ink">
                    <p className="text-[26px] font-bold text-ink">
                        ${offer.price.toLocaleString()}
                    </p>
                </span>
            </div>
        </div>
    );
}
function Cuerpo({ offer }: { offer: ShipmentOffer }) {
    const { pickupAddress: p, deliveryAddress: d } = offer;
    return (
        <div>

            <div className="flex flex-col gap-4 relative bg-cream p-4 rounded-[16px]">
                {/* Línea punteada decorativa entre iconos */}
                <div className="absolute left-[7px] top-[22px] bottom-[22px] w-[1px] border-l border-dashed border-line-2" />

                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-bone flex items-center justify-center shrink-0 z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-clay" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-ink-3 uppercase leading-none mb-1">Origen</p>
                        <p className="text-[13px] text-ink font-medium truncate">
                            {p.street} {p.number}
                            {p.floor ? `, ${p.floor}°${p.apartment || ''}` : ''}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-bone flex items-center justify-center shrink-0 z-10">
                        <MapPin size={10} className="text-cocoa" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-ink-3 uppercase leading-none mb-1">Destino</p>
                        <p className="text-[13px] text-ink font-medium truncate">
                            {d.street} {d.number}
                            {d.floor ? `, ${d.floor}°${d.apartment || ''}` : ''}
                        </p>
                    </div>
                </div>
            </div>
            <div className="pt-2 flex items-center gap-4 w-full">
                <DistanceTag value={offer.distance} />
                <WeightTag value={offer.weight} />
                <TimeTag value={offer.estimatedTime} />
            </div>
        </div>

    );
}

function Pie({ offer }: { offer: ShipmentOffer }) {
    return (
        <div className="pt-4 border-t border-line flex items-center gap-4 w-full">
            <ViewDetailsButton shippingId={offer.shippingId} />
            <TakeShipmentButton shippingId={offer.shippingId} />
        </div>
    );
}