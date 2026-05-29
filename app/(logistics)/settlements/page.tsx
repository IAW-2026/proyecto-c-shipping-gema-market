import { Suspense } from "react";

import { Metadata } from "next";
import { PageWrapper, Content } from "../_components/page-layout";
import { SettlementsHeader } from "./_components/settlements-header";
import { SettlementsContent } from "./_components/settlements-content";
import { SettlementsContentSkeleton } from "./_components/settlements-content-skeleton";



export const metadata: Metadata = {
    title: "Liquidaciones | UniHousing Shipping",
    description: "Gestión de liquidaciones y balance de ganancias. Detalle de pagos devengados por servicios logísticos prestados y estado de transferencias pendientes.",
};

export default function SettlementsPage() {
    return (
        <PageWrapper>
            <SettlementsHeader />
            <Content className="flex flex-col p-4 lgx:p-7 gap-6">
                <Suspense fallback={<SettlementsContentSkeleton />}>
                    <SettlementsContent />
                </Suspense>
            </Content>
        </PageWrapper>
    );
}
