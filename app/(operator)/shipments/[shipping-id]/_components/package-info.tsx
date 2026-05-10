import { Card } from "@/components/ui/card";

interface PackageInfoProps {
    weight: number;
    height: number;
    width: number;
    depth: number;
    orderId: string;
}

export function PackageInfo({ weight, height, width, depth, orderId }: PackageInfoProps) {
    const volume = height * width * depth;

    return (
        <Card padding="md">
            <h4 className="m-0 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-[0.06em] font-mono">Paquete</h4>
            <div className="flex flex-col gap-1.5 text-[13px]">
                <div className="flex justify-between">
                    <span className="text-ink-2">Peso</span>
                    <strong className="text-ink-3">{weight} kg</strong>
                </div>
                <div className="flex justify-between">
                    <span className="text-ink-2">Dimensiones</span>
                    <strong className="text-ink-3">{height}x{width}x{depth} cm</strong>
                </div>
                <div className="flex justify-between">
                    <span className="text-ink-2">Volumen</span>
                    <strong className="text-ink-3">{volume.toLocaleString()} cm³</strong>
                </div>
                <div className="flex justify-between mt-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-ink-2">Pedido</span>
                    <strong className="font-mono text-xs text-ink-3">{orderId}</strong>
                </div>
            </div>
        </Card>
    );
}
