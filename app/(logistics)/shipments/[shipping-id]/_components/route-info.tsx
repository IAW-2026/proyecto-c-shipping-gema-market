import { Card } from "@/components/ui/card";
import { Address } from "@/lib/definitions/shipment";
import { Tag, Home } from "lucide-react";

interface RouteInfoProps {
    pickupAddress: Address;
    deliveryAddress: Address;
}

export function RouteInfo({ pickupAddress, deliveryAddress }: RouteInfoProps) {
    const formatAddress = (address: Address) => {
        let base = `${address.street} ${address.number}`;
        if (address.floor) base += `, Piso ${address.floor}`;
        if (address.apartment) base += `, Depto ${address.apartment}`;
        return base;
    };

    const points = [
        {
            label: "Punto de retiro",
            addr: formatAddress(pickupAddress),
            icon: <Tag size={16} />,
            color: "#7f4f24",
            time: "10:30" // Placeholder as in design
        },
        {
            label: "Destino",
            addr: formatAddress(deliveryAddress),
            icon: <Home size={16} />,
            color: "#414833",
            time: "11:15 ETA" // Placeholder as in design
        },
    ];

    return (
        <Card padding="md">
            <h3 className="m-0 mb-4 text-ink font-semibold">Ruta</h3>
            <div className="flex flex-col">
                {points.map((p, i) => (
                    <div key={i} className={`flex gap-3.5 relative ${i === 0 ? "pb-4" : ""}`}>
                        {i === 0 && <div className="absolute top-9 left-[17px] bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />}
                        <div
                            className="w-9 h-9 rounded-full text-white flex items-center justify-center shrink-0 relative z-[1]"
                            style={{ background: p.color }}
                        >
                            {p.icon}
                        </div>
                        <div className="flex-1 pt-1.5">
                            <div className="text-[11px] text-slate-500 font-mono">{p.label.toUpperCase()} · {p.time}</div>
                            <div className="font-medium text-ink text-sm">{p.addr}</div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
