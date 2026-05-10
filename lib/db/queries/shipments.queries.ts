// lib/db/queries/shipments.queries.ts
import { Shipment, ShipmentOffer, ShipmentSummary } from "@/lib/definitions/shipment"

const MOCK_SHIPMENTS: Shipment[] = [
    {
        shippingId: "shp_04MNB23BP9D2BJ6L1T3PB15678",
        orderId: "ord_04MNB23BP9D2BJ6L1T3PB15678",
        buyerId: "usr_02KLY01ZN7B0ZH4J9R1M9Z3456",
        buyerName: "Emiliano Santillán",
        sellerId: "usr_02KLY81ZN7B0ZH4J9R1M9Z3456",
        logisticsId: "usr_07KLY01ZN7B0ZH4J9R1M9Z3456",
        status: "delivered",
        trackingCode: "TRK-001",
        pickupAddress: { street: "Rodriguez", number: "10", zip: "8000" },
        deliveryAddress: { street: "Av. Alem", number: "1253", zip: "8000" },
        price: 2400,
        pickedUpAt: new Date("2024-03-10T11:00:00Z"),
        deliveredAt: new Date("2024-03-10T12:30:00Z"),
        createdAt: new Date("2024-03-10T10:00:00Z"),
        weight: 1.5,
        height: 20,
        width: 15,
        depth: 10,
        distance: 2.3
    },
    {
        shippingId: "shp_01HGW89XN5Z8XF2H7P9K7X1234",
        orderId: "ord_02KLY01ZN7B0ZH4J5R1M9Z3456",
        buyerId: "usr_02KLY01ZN7B0ZH4J9R1M9Z3456",
        buyerName: "Juan Pérez",
        sellerId: "usr_02KLY81ZN7B0ZH4J9R1M9Z3456",
        logisticsId: "usr_07KLY01ZN7B0ZH4J9R1M9Z3456",
        status: "in_transit",
        trackingCode: "TRK-9821",
        pickupAddress: { street: "Av. Colón", number: "234", zip: "8000" },
        deliveryAddress: { street: "Av. Alem", number: "1253", zip: "8000", floor: "4", apartment: "B" },
        price: 4500,
        pickedUpAt: new Date("2026-05-07T10:30:00Z"),
        deliveredAt: null,
        createdAt: new Date("2026-05-06T15:00:00Z"),
        weight: 8.5,
        height: 40,
        width: 30,
        depth: 20,
        distance: 5.1
    },
    {
        shippingId: "shp_03LMZ12AO8C1AI5K0S2NA04567",
        orderId: "ord_03LMZ12AO8C1AI5K0S2NA04567",
        buyerId: "usr_02KLY01ZN7B0ZH4J9R1M9Z3456",
        buyerName: "María García",
        sellerId: "usr_02KLY81ZN7B0ZH4J9R1M9Z3456",
        logisticsId: "usr_07KLY01ZN7B0ZH4J9R1M9Z3456",
        status: "delivered",
        trackingCode: "TRK-002",
        pickupAddress: { street: "San Martín", number: "500", zip: "8000" },
        deliveryAddress: { street: "Brown", number: "510", zip: "8000" },
        price: 1200,
        pickedUpAt: new Date("2024-03-11T15:00:00Z"),
        deliveredAt: new Date("2024-03-11T16:00:00Z"),
        createdAt: new Date("2024-03-11T14:30:00Z"),
        weight: 1,
        height: 15,
        width: 10,
        depth: 5,
        distance: 2.5
    },
    {
        shippingId: "shp_02KLY01ZN7B0ZH4J9R1M9Z3456",
        orderId: "ord_02KLY01ZN7B0ZH4J9R1M9Z3456",
        buyerId: "usr_02KLY01ZN7B0ZH4J9R1M9Z3456",
        buyerName: "Carlos López",
        sellerId: "usr_02KLY81ZN7B0ZH4J9R1M9Z3456",
        logisticsId: "usr_07KLY01ZN7B0ZH4J9R1M9Z3456",
        status: "pending_pickup",
        trackingCode: "TRK-003",
        pickupAddress: { street: "Estomba", number: "200", zip: "8000" },
        deliveryAddress: { street: "Donado", number: "845", zip: "8000", floor: "2", apartment: "A" },
        price: 1800,
        pickedUpAt: null,
        deliveredAt: null,
        createdAt: new Date("2024-03-12T09:15:00Z"),
        weight: 15,
        height: 50,
        width: 40,
        depth: 30,
        distance: 6.8
    },
    {
        shippingId: "shp_01JKX90YM6A9YG3I8Q0L8Y2345",
        orderId: "ord_01JKX90YM6A9YG3I8Q0L8Y2345",
        buyerId: "usr_02KLY01ZN7B0ZH4J9R1M9Z3456",
        buyerName: "Ana Martínez",
        sellerId: "usr_02KLY81ZN7B0ZH4J9R1M9Z3456",
        logisticsId: "usr_07KLY01ZN7B0ZH4J9R1M9Z3456",
        status: "pending_pickup",
        trackingCode: "TRK-004",
        pickupAddress: { street: "Sarmiento", number: "45", zip: "8000" },
        deliveryAddress: { street: "Alsina", number: "120", zip: "8000" },
        price: 3200,
        pickedUpAt: null,
        deliveredAt: null,
        createdAt: new Date("2024-03-13T11:00:00Z"),
        weight: 2,
        height: 20,
        width: 15,
        depth: 10,
        distance: 1.2
    }
];

export async function getShipmentDetails(shippingId: string): Promise<Shipment | null> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    const shipment = MOCK_SHIPMENTS.find(s => s.shippingId === shippingId);
    return shipment || null;
}

export async function getShipmentOffers(): Promise<ShipmentOffer[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    // Retornamos solo los que están pendientes de retiro como ofertas
    return MOCK_SHIPMENTS
        .filter(s => s.status === "pending_pickup")
        .map(s => ({
            shippingId: s.shippingId,
            price: s.price,
            pickupAddress: s.pickupAddress,
            deliveryAddress: s.deliveryAddress,
            weight: s.weight,
            height: s.height,
            width: s.width,
            depth: s.depth,
            distance: s.distance,
            estimatedTime: `${Math.round((s.distance || 1) * 3)} min`
        }));
}

export async function getShipmentHistory(userId: string): Promise<ShipmentSummary[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    // En una app real filtraríamos por el repartidor (userId)
    // Aquí devolvemos todos los que tienen un estado avanzado o finalizado
    return MOCK_SHIPMENTS.map(s => ({
        shippingId: s.shippingId,
        orderId: s.orderId,
        trackingCode: s.trackingCode,
        status: s.status,
        pickupAddress: s.pickupAddress,
        deliveryAddress: s.deliveryAddress,
        price: s.price,
        createdAt: s.createdAt
    }));
}