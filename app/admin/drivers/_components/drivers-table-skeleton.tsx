import { Skeleton } from "@/components/ui/skeleton";

export function AdminDriversTableSkeleton() {
    return (
        <div className="bg-paper border border-line rounded-r2 overflow-hidden">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-bone text-ink-2 text-left">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <th key={i} className="px-4 py-3">
                                <Skeleton className="h-3 w-16" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {[1, 2, 3, 4, 5].map((row) => (
                        <tr key={row} className="border-t border-line">
                            {[1, 2, 3, 4, 5, 6].map((col) => (
                                <td key={col} className="px-4 py-3">
                                    <Skeleton className={`h-4 ${col === 1 ? "w-24" : col === 2 ? "w-32" : col === 3 ? "w-16" : col === 4 ? "w-8" : col === 5 ? "w-16" : "w-16"}`} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
