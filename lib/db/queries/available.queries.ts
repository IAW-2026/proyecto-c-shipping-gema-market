import { ShipmentSummary } from "../../definitions/shipment";

/**
 * Mock de envíos disponibles para la Etapa 2.
 * Cumple estrictamente con la interfaz ShipmentSummary.[cite: 5]
 */
export async function getAvailableShipments(): Promise<ShipmentSummary[]> {
    // Simulamos latencia de red para validar el estado de carga (Loading UI)
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
        {
            id: "SHP_01HXYZ1234567890ABCDEF",
            orderId: "ORD_9912",
            trackingCode: "BB-001-2026",
            status: "pending_pickup",
            pickupAddress: { street: "Av. Alem", number: "1253", zip: "8000" },
            deliveryAddress: { street: "San Martín", number: "123", zip: "8000", floor: "2", apartment: "B" },
            price: 4500,
            createdAt: new Date(),
        },
        {
            id: "SHP_01HXYZ78901234567890XY",
            orderId: "ORD_9915",
            trackingCode: "BB-002-2026",
            status: "pending_pickup",
            pickupAddress: { street: "12 de Octubre", number: "1050", zip: "8000" },
            deliveryAddress: { street: "Alsina", number: "45", zip: "8000" },
            price: 3800,
            createdAt: new Date(),
        },
        {
            id: "SHP_01HXYZ4567890123456789",
            orderId: "ORD_9920",
            trackingCode: "BB-003-2026",
            status: "pending_pickup",
            pickupAddress: { street: "Sarmiento", number: "341", zip: "8000" },
            deliveryAddress: { street: "Urquiza", number: "800", zip: "8000" },
            price: 5200,
            createdAt: new Date(),
        }
    ];
}