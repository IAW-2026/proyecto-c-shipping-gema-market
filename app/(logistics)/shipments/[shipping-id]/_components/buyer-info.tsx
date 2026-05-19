import { Card } from "@/components/ui/card";

interface BuyerInfoProps {
    buyerName: string;
    buyerPhone: string;
}

export function BuyerInfo({ buyerName, buyerPhone }: BuyerInfoProps) {
    const avatarColor = "#" + buyerName.split("").reduce((acc, char) => (acc + char.charCodeAt(0)) % 16777215, 0).toString(16).padEnd(6, "0");
    const initial = buyerName.charAt(0).toUpperCase();

    return (
        <Card padding="md">
            <h4 className="m-0 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-[0.06em] font-mono">Comprador</h4>
            <div className="flex items-center gap-3">
                <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: avatarColor }}
                >
                    {initial}
                </div>
                <div className="flex-1">
                    <div className="font-semibold font-sans text-sm text-ink">{buyerName}</div>
                    <div className="text-xs text-slate-500">{buyerPhone}</div>
                </div>
            </div>
        </Card>
    );
}
