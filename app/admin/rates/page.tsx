import { Suspense } from "react";

import { PageWrapper, Header, Content } from "../_components";
import { CreateRateForm } from "./_components/create-rate-form";
import { AdminRatesTableData } from "./_components/rates-table-data";
import { AdminRatesTableSkeleton } from "./_components/rates-table-skeleton";
import { Plus } from "lucide-react";




export default function AdminRatesPage() {
    return (
        <PageWrapper>
            <Header title="Tarifas" subtitle="Configuración" />
            <Content className="p-4 lgx:p-7">
                <div className="bg-paper border border-line rounded-r2 p-5 mb-6">
                    <h2 className="text-sm font-semibold text-ink-3 mb-3 flex items-center gap-2">
                        <Plus size={16} /> Nueva tarifa
                    </h2>
                    <CreateRateForm />
                </div>

                <Suspense fallback={<AdminRatesTableSkeleton />}>
                    <AdminRatesTableData />
                </Suspense>
            </Content>
        </PageWrapper>
    );
}
