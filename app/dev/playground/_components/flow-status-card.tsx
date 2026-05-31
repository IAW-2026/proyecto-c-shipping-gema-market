import type { FlowStatus } from "./types";

export function FlowStatusCard({
    flow,
    onReset,
}: {
    flow: FlowStatus;
    onReset: () => void;
}) {
    return (
        <div className="bg-paper border border-line rounded-r3 p-4">
            <h3 className="text-sm font-semibold text-ink mb-3">Estado del flujo</h3>
            <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                    <span className="text-ink-3">Cotizacion</span>
                    <span className={`font-mono font-medium ${flow.quote_id ? "text-success" : "text-ink-3"}`}>
                        {flow.quote_id ? flow.quote_id.slice(0, 16) + "..." : "—"}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-ink-3">Orden</span>
                    <span className={`font-mono font-medium ${flow.order_id ? "text-success" : "text-ink-3"}`}>
                        {flow.order_id ? flow.order_id.slice(0, 16) + "..." : "—"}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-ink-3">Envio</span>
                    <span className={`font-mono font-medium ${flow.shipping_id ? "text-success" : "text-ink-3"}`}>
                        {flow.shipping_id ? flow.shipping_id.slice(0, 16) + "..." : "—"}
                    </span>
                </div>
                {flow.tracking_code && (
                    <div className="pt-2 border-t border-line">
                        <div className="flex items-center justify-between">
                            <span className="text-ink-3">Tracking</span>
                            <span className="font-mono font-medium text-clay">{flow.tracking_code}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <span className="text-ink-3">Estado</span>
                            <span className="font-medium text-ink">{flow.status}</span>
                        </div>
                    </div>
                )}
            </div>
            <button
                onClick={onReset}
                className="mt-3 w-full text-[11px] text-ink-3 hover:text-ink transition-colors py-1 font-medium"
            >
                Reiniciar flujo
            </button>
        </div>
    );
}
