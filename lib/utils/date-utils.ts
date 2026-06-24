export function toDate(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
}

const TZ = "America/Argentina/Buenos_Aires";

export function formatDate(
    value: Date | string | null | undefined,
    opts?: Intl.DateTimeFormatOptions
): string {
    const d = toDate(value);
    if (!d) return "";
    return d.toLocaleDateString("es-AR", { ...opts ?? { day: "2-digit", month: "2-digit", year: "numeric" }, timeZone: TZ });
}

export function formatDateTime(
    value: Date | string | null | undefined
): string {
    const d = toDate(value);
    if (!d) return "";
    const date = d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", timeZone: TZ });
    const time = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
    return `${date} ${time}`;
}
