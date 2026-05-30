import { Fieldset } from "./fieldset";
import { Input } from "./input";
import type { PlaygroundConfig } from "./types";

export function ConfigPanel({
    config,
    configOpen,
    setConfigOpen,
    updateConfig,
}: {
    config: PlaygroundConfig;
    configOpen: boolean;
    setConfigOpen: (open: boolean) => void;
    updateConfig: (patch: Partial<PlaygroundConfig>) => void;
}) {
    return (
        <div className="bg-paper border border-line rounded-r3 mb-6 overflow-hidden">
            <button
                onClick={() => setConfigOpen(!configOpen)}
                className="w-full flex items-center gap-2 px-5 py-3 text-sm font-semibold text-ink hover:bg-cream/50 transition"
            >
                Configuracion
                <span className="ml-auto text-ink-3 text-xs">{configOpen ? "▲" : "▼"}</span>
            </button>
            {configOpen && (
                <div className="p-5 border-t border-line space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Fieldset title="Direccion de origen">
                            <Input label="Calle" value={config.origin_street} onChange={(v) => updateConfig({ origin_street: v })} />
                            <div className="flex gap-2">
                                <Input label="Numero" value={config.origin_number} onChange={(v) => updateConfig({ origin_number: v })} className="flex-1" />
                                <Input label="CP" value={config.origin_zip} onChange={(v) => updateConfig({ origin_zip: v })} className="w-24" />
                            </div>
                        </Fieldset>
                        <Fieldset title="Direccion de destino">
                            <Input label="Calle" value={config.dest_street} onChange={(v) => updateConfig({ dest_street: v })} />
                            <div className="flex gap-2">
                                <Input label="Numero" value={config.dest_number} onChange={(v) => updateConfig({ dest_number: v })} className="flex-1" />
                                <Input label="CP" value={config.dest_zip} onChange={(v) => updateConfig({ dest_zip: v })} className="w-24" />
                            </div>
                        </Fieldset>
                        <Fieldset title="Datos del comprador">
                            <Input label="Nombre" value={config.buyer_name} onChange={(v) => updateConfig({ buyer_name: v })} />
                            <Input label="Telefono" value={config.buyer_phone} onChange={(v) => updateConfig({ buyer_phone: v })} />
                        </Fieldset>
                    </div>
                    <Fieldset title="Dimensiones del paquete">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Input label="Peso (kg)" type="number" value={String(config.weight_kg)} onChange={(v) => updateConfig({ weight_kg: Number(v) })} />
                            <Input label="Alto (cm)" type="number" value={String(config.height_cm)} onChange={(v) => updateConfig({ height_cm: Number(v) })} />
                            <Input label="Ancho (cm)" type="number" value={String(config.width_cm)} onChange={(v) => updateConfig({ width_cm: Number(v) })} />
                            <Input label="Profundidad (cm)" type="number" value={String(config.depth_cm)} onChange={(v) => updateConfig({ depth_cm: Number(v) })} />
                        </div>
                    </Fieldset>
                </div>
            )}
        </div>
    );
}
