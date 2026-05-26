import { getAllRates } from "@/lib/db/queries/dashboard";
import { updateRateAction } from "@/lib/actions/admin.actions";
import { DeleteRateButton } from "./delete-rate-button";

export async function AdminRatesTableData() {
    const rates = await getAllRates();

    if (rates.length === 0) {
        return (
            <div className="bg-paper border border-line rounded-r2 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-bone text-ink-2 text-left">
                            <th className="px-4 py-3 font-medium">Rango de peso (kg)</th>
                            <th className="px-4 py-3 font-medium">Precio por km (USD)</th>
                            <th className="px-4 py-3 font-medium text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-ink-2">
                                No hay tarifas configuradas.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="bg-paper border border-line rounded-r2 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-bone text-ink-2 text-left">
                        <th className="px-4 py-3 font-medium">Rango de peso (kg)</th>
                        <th className="px-4 py-3 font-medium">Precio por km (USD)</th>
                        <th className="px-4 py-3 font-medium text-right">Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {rates.map((r) => (
                        <tr key={r.id} className="border-t border-line hover:bg-bone/30">
                            <td className="px-4 py-3 text-ink-3">
                                {r.weight_min} — {r.weight_max} kg
                            </td>
                            <td className="px-4 py-3">
                                <form action={async (formData: FormData) => {
                                    "use server";
                                    const price = Number(formData.get("pricePerKm"));
                                    await updateRateAction(r.id, price);
                                }} className="flex items-center gap-1">
                                    <span className="text-ink-2 mr-1">$</span>
                                    <input
                                        type="number"
                                        name="pricePerKm"
                                        defaultValue={r.price_per_km}
                                        step="0.01"
                                        min="0"
                                        className="w-24 text-sm px-2 py-1 border border-line rounded-lg bg-transparent text-ink-3 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                    <button
                                        type="submit"
                                        className="text-xs bg-cocoa text-paper px-3 py-1.5 rounded-lg font-medium hover:bg-cocoa/90 transition-colors"
                                    >
                                        Guardar
                                    </button>
                                </form>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <DeleteRateButton id={r.id} label={`${r.weight_min} — ${r.weight_max} kg`} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
