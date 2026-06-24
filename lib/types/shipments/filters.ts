import type { ShipmentStatus } from "@/lib/constants/shipment";

export interface ShipmentFilterParams {
    logisticsId?: string;
    status?: ShipmentStatus | ShipmentStatus[];
    query?: string;
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    pageSize?: number;
    sortBy?: 'created_at' | 'price' | 'tracking_code' | 'status' | 'weight' | 'distance' | 'delivered_at';
    sortOrder?: 'asc' | 'desc';
    weightMin?: number;
    weightMax?: number;
    priceMin?: number;
    priceMax?: number;
    distanceMin?: number;
    distanceMax?: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
