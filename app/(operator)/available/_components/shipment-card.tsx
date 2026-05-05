import { Card } from "@/components/ui/card";
import { MapPin, Check, Clock, ArrowRight } from "lucide-react";
import { WeightTag, TimeTag, DistanceTag } from "./available_shipment_tags";

// Parámetros hardcodeados para previsualización estética
const mockData = {
    trackingCode: "TRK-9820",
    orderId: "OR-2840",
    price: 4500,
    pickup: "Av. Alem 1253",
    delivery: "12 de Octubre 1050",
    distance: "5.1 km",
    weight: "8 kg",
    time: "15 min"
};
export function AvailableShipmentCard() {
    return (
        <Card className="p-5 flex flex-col gap-5 bg-paper">
            <Cabecera />
            <Cuerpo />
            <Pie />
        </Card>
    );
}

function Cabecera() {
    return (
        <div className="flex justify-between items-start">
            <div>
                <span className="text-[12px] font-mono  text-ink-3 uppercase tracking-wider block mb-1">
                    {mockData.trackingCode} · {mockData.orderId}
                </span>
                <span className="font-sans text-sm font-semibold text-ink">
                    <p className="text-[26px] font-bold text-ink">${mockData.price}</p>
                </span>
            </div>
        </div>
    );
}
function Cuerpo() {
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
                        <p className="text-[13px] text-ink font-medium truncate">{mockData.pickup}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-bone flex items-center justify-center shrink-0 z-10">
                        <MapPin size={10} className="text-cocoa" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-ink-3 uppercase leading-none mb-1">Destino</p>
                        <p className="text-[13px] text-ink font-medium truncate">{mockData.delivery}</p>
                    </div>
                </div>
            </div>
            <div className="pt-2 flex items-center gap-4 w-full">
                <DistanceTag value={mockData.distance} />
                <WeightTag value={mockData.weight} />
                <TimeTag value={`~${mockData.time}`} />
            </div>
        </div>

    );
}

function Pie() {
    return (
        <div className="pt-4 border-t border-line flex items-center gap-4 w-full">
            <button className="flex-1 bg-paper text-ink h-11 rounded-full text-xs font-bold hover:bg-cream transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                Ver detalles
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex-1 bg-clay text-paper h-11 rounded-full text-xs font-bold hover:bg-cocoa transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                <Check size={14} />
                Tomar envío
            </button>
        </div>
    );
}