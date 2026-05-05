import { ShipmentSummary } from "../../definitions/shipment";
import { DashboardMetrics } from "@/lib/definitions/dashboard-metrics";

/**
 * DAO (Data Access Object) para métricas del dashboard.
 * Las lecturas (queries) a nuestra propia base de datos PostgreSQL se aíslan aquí.
 * Arquitectónicamente, esto separa el acceso a datos de los Server Actions (mutaciones) 
 * y de los Servicios de integración M2M.
 */
export async function getDashboardMetrics(operatorId: string): Promise<DashboardMetrics> {
    // Simulación de latencia de base de datos local para la Etapa 2.
    // TODO (Etapa 3): Reemplazar este mock por una consulta a la BD usando el ORM (Drizzle o Prisma).
    // Ej: return await db.select().from(shipments).where(eq(shipments.operatorId, operatorId));
    await new Promise((resolve) => setTimeout(resolve, 80));

    return {
        shipmentToday: 5,
        totalEarnings: 18300,
        totalDistance: 30,
    };
}
/**
 * DAO para obtener los envíos activos asignados a un operador.
 */
export async function getActiveShipments(operatorId: string): Promise<ShipmentSummary[]> {
    // Simulación de latencia de base de datos local para la Etapa 2.
    // TODO (Etapa 3): Reemplazar por consulta ORM real a la base de datos PostgreSQL de la Shipping App.
    await new Promise((resolve) => setTimeout(resolve, 100));

    return [
        {
            id: "SHP-001",
            orderId: "ORD-991",
            status: "in_transit",
            trackingCode: "TRK-88291",
            pickupAddress: { street: "San Martín 123", number: "123", zip: "8000" },
            deliveryAddress: { street: "Av. Alem", number: "1253", zip: "8000", floor: "4B" },
            price: 2400,
            createdAt: new Date(),
        },
        {
            id: "SHP-002",
            orderId: "ORD-992",
            status: "pending_pickup",
            trackingCode: "TRK-88292",
            pickupAddress: { street: "Alsina 45", number: "45", zip: "8000" },
            deliveryAddress: { street: "Sarmiento", number: "341", zip: "8000" },
            price: 1800,
            createdAt: new Date(),
        }
    ];
}
