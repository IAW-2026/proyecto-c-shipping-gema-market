/** Validaciones de negocio para los estados de una cotización (reservar / liberar). */
interface QuoteRecord {
    valid_until: Date;
    status: string;
    reserved_for_order_id: string | null;
}

export function validateQuoteForReservation(cotizacion: QuoteRecord | null, orderId: string): void {
    if (!cotizacion) {
        throw Object.assign(new Error("Cotización no encontrada"), { statusCode: 404, code: "NOT_FOUND" });
    }
    if (cotizacion.valid_until < new Date()) {
        throw Object.assign(new Error("La cotización ha vencido"), { statusCode: 410, code: "GONE" });
    }
    if (cotizacion.status === "reserved" && cotizacion.reserved_for_order_id !== orderId) {
        throw Object.assign(new Error("La cotización ya está reservada por otra orden"), {
            statusCode: 409,
            code: "CONFLICT",
        });
    }
    if (cotizacion.status === "confirmed") {
        throw Object.assign(new Error("La cotización ya fue confirmada"), { statusCode: 409, code: "CONFLICT" });
    }
}

export function validateQuoteForRelease(cotizacion: unknown): void {
    if (!cotizacion) {
        throw Object.assign(new Error("No hay reserva activa para esta cotización y orden"), {
            statusCode: 404,
            code: "NOT_FOUND",
        });
    }
}
