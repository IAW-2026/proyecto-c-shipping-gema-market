import { MapIframe } from "@/components/ui/map-iframe";

export function MapWrapper({ shippingId }: { shippingId: string }) {
    return <MapIframe shippingId={shippingId} className="h-full w-full min-h-[300px]" />;
}
