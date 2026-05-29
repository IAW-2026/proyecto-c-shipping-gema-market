import { ulid } from "ulid";

export function generatePrefixedId(prefix: string) {
    return `${prefix}_${ulid()}`;
}

export function isNextDynamicServerError(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        (error as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE'
    );
}
