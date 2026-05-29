interface MapIframeProps {
    shippingId: string;
    className?: string;
}

export function MapIframe({ shippingId, className }: MapIframeProps) {
    const src = `/api/map-frame?shippingId=${encodeURIComponent(shippingId)}`;
    return (
        <iframe
            src={src}
            className={className ?? "h-full w-full border-0"}
            title="Mapa de entrega"
            sandbox="allow-scripts allow-same-origin"
        />
    );
}
