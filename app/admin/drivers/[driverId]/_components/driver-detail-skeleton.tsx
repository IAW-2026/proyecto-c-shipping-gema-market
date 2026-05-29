import { Skeleton } from "@/components/ui/skeleton";
import { Header, Content, PageWrapper } from "../../../_components";

export function DriverDetailSkeleton() {
    return (
        <PageWrapper>
            <Header
                title={<Skeleton className="h-6 w-48" />}
            />
            <Content className="p-4 lgx:p-7">
                <div className="grid gap-4 md:grid-cols-3 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-paper border border-line rounded-r2 p-5 flex items-center gap-4">
                            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                            <div>
                                <Skeleton className="h-8 w-16 mb-1" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-paper border border-line rounded-r2 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-bone text-ink-2 text-left">
                                    {[1, 2, 3, 4].map((i) => (
                                        <th key={i} className="px-4 py-3">
                                            <Skeleton className="h-3 w-16" />
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4].map((row) => (
                                    <tr key={row} className="border-t border-line">
                                        {[1, 2, 3, 4].map((col) => (
                                            <td key={col} className="px-4 py-3">
                                                <Skeleton className={`h-4 ${col === 1 ? "w-32" : col === 2 ? "w-20" : col === 3 ? "w-16" : "w-16"}`} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Content>
        </PageWrapper>
    );
}
