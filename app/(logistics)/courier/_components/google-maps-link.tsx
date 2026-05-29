"use client";

import Image from "next/image";
import { formatGmapsUrl } from "@/lib/utils/address-utils";
import type { Address } from "@/lib/schemas/domain";

interface GoogleMapsLinkProps {
    origin: Address;
    destination: Address;
}

export function GoogleMapsLink({ origin, destination }: GoogleMapsLinkProps) {
    const handleClick = () => {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(formatGmapsUrl(origin))}&destination=${encodeURIComponent(formatGmapsUrl(destination))}&travelmode=driving`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <button
            onClick={handleClick}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shrink-0 transition-colors shadow-sm"
            title="Abrir en Google Maps"
        >
            <Image src="/images/google_maps_icon.png" alt="Google Maps" width={20} height={20} className="w-5 h-5" />
        </button>
    );
}
