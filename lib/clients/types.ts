/**
 * Tipos base para todos los clientes de API de la aplicación.
 * Define la estructura estándar de respuesta y errores para el patrón Adapter.
 */

export interface ApiResponse<T> {
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    status: number;
}

export type ApiResult<T> = Promise<ApiResponse<T>>;
