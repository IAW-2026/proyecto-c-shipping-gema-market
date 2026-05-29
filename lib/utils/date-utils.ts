export function toDate(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
}

export function formatDate(
    value: Date | string | null | undefined,
    opts?: Intl.DateTimeFormatOptions
): string {
    const d = toDate(value);
    if (!d) return "";
    return d.toLocaleDateString("es-AR", opts ?? { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(
    value: Date | string | null | undefined
): string {
    const d = toDate(value);
    if (!d) return "";
    const date = d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
    const time = d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
}
