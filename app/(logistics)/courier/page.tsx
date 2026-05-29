import { Suspense } from "react";
import { preconnect, prefetchDNS } from "react-dom";
import { Metadata } from "next";
import { PageWrapper } from "../_components/page-layout";
import { CourierContent } from "./_components/courier-content";
import { CourierSkeleton } from "./_components/courier-skeleton";

export const metadata: Metadata = {
    title: "Modo repartidor | UniHousing Shipping",
    description: "Interfaz optimizada para el proceso de entrega activo.",
};

export default function CourierPage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    preconnect("https://tile.openstreetmap.org");
    prefetchDNS("https://tile.openstreetmap.org");

    return (
        <PageWrapper>
            <Suspense fallback={<CourierSkeleton />}>
                <CourierContent searchParams={props.searchParams} />
            </Suspense>
        </PageWrapper>
    );
}
