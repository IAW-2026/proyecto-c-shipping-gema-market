import dynamic from "next/dynamic";

const MapViewer = dynamic(
    () => import("@/components/ui/map-viewer"),
    { ssr: false }
);

export function MapWrapper({ shippingId }: { shippingId: string }) {
    return <MapViewer shippingId={shippingId} className="h-full w-full min-h-[300px]" />;
}
