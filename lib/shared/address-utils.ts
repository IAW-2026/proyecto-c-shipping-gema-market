import type { Address } from "@/lib/definitions/shipments";

export function formatAddress(address: Address): string {
    let base = address.street;
    if (address.number) base += ` ${address.number}`;
    if (address.floor) base += `, Piso ${address.floor}`;
    if (address.apartment) base += `, Depto ${address.apartment}`;
    return base;
}

export function formatGmapsUrl(address: Address): string {
    return `${address.street}${address.number ? ` ${address.number}` : ""}, Bahía Blanca, Argentina`;
}
