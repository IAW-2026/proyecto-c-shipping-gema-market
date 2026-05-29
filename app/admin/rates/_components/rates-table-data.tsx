import { getAllRates } from "@/lib/db/queries/admin/rates";
import { updateRateAction } from "@/lib/features/admin/actions";
import { DeleteRateButton } from "./delete-rate-button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

export async function AdminRatesTableData({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const raw = await searchParams;
    const page = parseInt(raw.page || "1", 10) || 1;
    const result = await getAllRates(page);

    return (
        <div className="bg-paper border border-line rounded-r2 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Rango de peso (kg)</TableHead>
                        <TableHead>Precio por km (USD)</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result.data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center text-ink-2">
                                No hay tarifas configuradas.
                            </TableCell>
                        </TableRow>
                    ) : (
                        result.data.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell className="text-ink-3">
                                    {r.weight_min} — {r.weight_max} kg
                                </TableCell>
                                <TableCell>
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
                                </TableCell>
                                <TableCell className="text-right">
                                    <DeleteRateButton id={r.id} label={`${r.weight_min} — ${r.weight_max} kg`} />
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <Pagination currentPage={result.page} totalPages={result.totalPages} />
        </div>
    );
}
