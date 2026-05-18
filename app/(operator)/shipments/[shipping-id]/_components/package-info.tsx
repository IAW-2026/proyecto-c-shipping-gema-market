import { Card } from "@/components/ui/card";

interface PackageInfoProps {
    weight: number;
    height: number;
    width: number;
    depth: number;
    orderId: string;
}

export function PackageInfo({ weight, height, width, depth, orderId }: PackageInfoProps) {
    const volumeCm3 = height * width * depth;
    const volumeM3 = volumeCm3 / 1_000_000;
    const volumetricWeight = Math.round(volumeM3 * 250 * 100) / 100;
    const billableWeight = Math.max(weight, volumetricWeight);

    return (
        <Card padding="md">
            <h4 className="m-0 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-[0.06em] font-mono">Paquete</h4>
            <div className="flex flex-col gap-1.5 text-[13px]">
                <div className="flex justify-between">
                    <span className="text-ink-2">Peso real</span>
                    <strong className="text-ink-3">{weight} kg</strong>
                </div>
                <div className="flex justify-between">
                    <span className="text-ink-2">Peso volumétrico</span>
                    <strong className="text-ink-3">{volumetricWeight} kg</strong>
                </div>
                <div className="flex justify-between bg-line/30 -mx-5 px-5 py-1.5 -my-1.5 rounded-[22px]">
                    <span className="text-ink font-semibold">Peso facturable</span>
                    <strong className="text-ink font-semibold">{billableWeight} kg</strong>
                </div>
                <div className="flex justify-between mt-1 pt-1 border-t border-line">
                    <span className="text-ink-2">Alto</span>
                    <strong className="text-ink-3">{height} cm</strong>
                </div>
                <div className="flex justify-between">
                    <span className="text-ink-2">Ancho</span>
                    <strong className="text-ink-3">{width} cm</strong>
                </div>
                <div className="flex justify-between">
                    <span className="text-ink-2">Profundidad</span>
                    <strong className="text-ink-3">{depth} cm</strong>
                </div>
                <div className="flex justify-between">
                    <span className="text-ink-2">Volumen</span>
                    <strong className="text-ink-3">{volumeCm3.toLocaleString()} cm³</strong>
                </div>
                <div className="flex justify-between mt-1 pt-1 border-t border-line">
                    <span className="text-ink-2">Pedido</span>
                    <strong className="font-mono text-xs text-ink-3">{orderId}</strong>
                </div>
            </div>
        </Card>
    );
}
