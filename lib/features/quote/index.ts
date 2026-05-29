/** Re-exporta las funciones públicas del módulo quote para mantener imports limpios. */
export { calculateQuote, reserveQuote, releaseQuote } from "./quote.service";
export type { QuoteResult } from "./quote.service";
