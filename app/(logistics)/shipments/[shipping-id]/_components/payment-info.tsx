import { Card } from "@/components/ui/card";

interface PaymentInfoProps {
    price: number;
}

export function PaymentInfo({ price }: PaymentInfoProps) {
    const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(price);

    return (
        <Card padding="md">
            <h4 className="m-0 mb-3 text-xs font-semibold text-ink uppercase tracking-[0.06em] font-mono">Pago al repartidor</h4>
            <div className="text-[28px] text-ink font-sans mb-1">{formattedPrice}</div>
            {/* Texto "Acreditado al cierre del día" fue eliminado intencionalmente */}
        </Card>
    );
}
