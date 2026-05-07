// lib/db/queries/shipments.queries.ts
import { Shipment, ShipmentOffer, ShipmentSummary } from "@/lib/definitions/shipment"
import { Address } from "@/lib/definitions/shipment";

export async function getShipmentDetails(shippingId: string): Promise<Shipment | null> {
    await new Promise((resolve) => setTimeout(resolve, 1))

    const mockShipment: Shipment = {
        // ID actualizado con el prefijo shp_ y el ULID de 26 caracteres
        shippingId: "shp_01HGW89XN5Z8XF2H7P9K7X1234",
        orderId: "ord_02KLY01ZN7B0ZH4J5R1M9Z3456",
        buyerId: "usr_02KLY01ZN7B0ZH4J9R1M9Z3456",
        sellerId: "usr_02KLY81ZN7B0ZH4J9R1M9Z3456",
        logisticsId: "usr_07KLY01ZN7B0ZH4J9R1M9Z3456",
        status: "in_transit",
        trackingCode: "TRK-9821",
        pickupAddress: {
            street: "Av. Colón",
            number: "234",
            zip: "8000"
        },
        deliveryAddress: {
            street: "Av. Alem",
            number: "1253",
            zip: "8000",
            floor: "4",
            apartment: "B"
        },
        price: 2400.00,
        pickedUpAt: new Date("2026-05-07T10:30:00Z"),
        deliveredAt: null,
        createdAt: new Date("2026-05-06T15:00:00Z")
    }

    return mockShipment
}

export async function getShipmentOffers(): Promise<ShipmentOffer[]> {
    // Simulamos la carga de datos
    await new Promise((resolve) => setTimeout(resolve, 1));
    return [
        {
            shippingId: "shp_01HGW89XN5Z8XF2H7P9K7X1234",
            price: 4500,
            pickupAddress: { street: "Av. Alem", number: "1253", zip: "8000" },
            deliveryAddress: { street: "12 de Octubre", number: "1050", zip: "8000" },
            weight: "8 kg",
            distance: "5.1 km",
            estimatedTime: "15 min"
        },
        {
            shippingId: "shp_01JKX90YM6A9YG3I8Q0L8Y2345",
            price: 3200,
            pickupAddress: { street: "Sarmiento", number: "45", zip: "8000" },
            deliveryAddress: { street: "Alsina", number: "120", zip: "8000" },
            weight: "2 kg",
            distance: "1.2 km",
            estimatedTime: "8 min"
        },
        {
            shippingId: "shp_02KLY01ZN7B0ZH4J9R1M9Z3456",
            price: 5800,
            pickupAddress: { street: "Estomba", number: "200", zip: "8000" },
            deliveryAddress: { street: "Zelarrayán", number: "650", zip: "8000", floor: "2", apartment: "A" },
            weight: "15 kg",
            distance: "6.8 km",
            estimatedTime: "22 min"
        },
        {
            shippingId: "shp_03LMZ12AO8C1AI5K0S2NA04567",
            price: 2900,
            pickupAddress: { street: "San Martín", number: "500", zip: "8000" },
            deliveryAddress: { street: "Belgrano", number: "1200", zip: "8000" },
            weight: "1 kg",
            distance: "2.5 km",
            estimatedTime: "10 min"
        },
        {
            shippingId: "shp_04MNB23BP9D2BJ6L1T3PB15678",
            price: 7500,
            pickupAddress: { street: "Rodriguez", number: "10", zip: "8000" },
            deliveryAddress: { street: "Chiclana", number: "300", zip: "8000" },
            weight: "25 kg",
            distance: "8.4 km",
            estimatedTime: "30 min"
        }
    ];
}

export async function getShipmentHistory(userId: string): Promise<ShipmentSummary[]> {
    // Simulamos latencia de red
    await new Promise((resolve) => setTimeout(resolve, 1));

    // Datos hardcodeados (Mocks)
    // En la Etapa 3, esto será: return db.shipments.findMany({ where: { logisticsId: userId } })
    return [
        {
            shippingId: "shp_04MNB23BP9D2BJ6L1T3PB15678",
            orderId: "ord_04MNB23BP9D2BJ6L1T3PB15678",
            trackingCode: "TRK-001",
            status: "delivered",
            pickupAddress: { street: "Rodriguez", number: "10", zip: "8000" }, // Requerido por el tipo
            deliveryAddress: { street: "Av. Alem", number: "1253", zip: "8000" },
            price: 2400,
            createdAt: new Date("2024-03-10T10:00:00Z")
        },
        {
            shippingId: "shp_03LMZ12AO8C1AI5K0S2NA04567",
            orderId: "ord_03LMZ12AO8C1AI5K0S2NA04567",
            trackingCode: "TRK-002",
            status: "delivered",
            pickupAddress: { street: "San Martín", number: "500", zip: "8000" },
            deliveryAddress: { street: "Brown", number: "510", zip: "8000" },
            price: 1200,
            createdAt: new Date("2024-03-11T14:30:00Z")
        },
        {
            shippingId: "shp_02KLY01ZN7B0ZH4J9R1M9Z3456",
            orderId: "ord_02KLY01ZN7B0ZH4J9R1M9Z3456",
            trackingCode: "TRK-003",
            status: "pending_pickup",
            pickupAddress: { street: "Estomba", number: "200", zip: "8000" },
            deliveryAddress: { street: "Donado", number: "845", zip: "8000" },
            price: 1800,
            createdAt: new Date("2024-03-12T09:15:00Z")
        },
        {
            shippingId: "shp_02KLY91ZN7B0ZH4J9R1M9Z3456",
            orderId: "ord_02KLY01ZN7B0ZH4J9R1M9Z3456",
            trackingCode: "TRK-003",
            status: "pending_pickup",
            pickupAddress: { street: "Estomba", number: "200", zip: "8000" },
            deliveryAddress: { street: "Donado", number: "845", zip: "8000" },
            price: 1800,
            createdAt: new Date("2024-03-12T09:15:00Z")
        }
    ];
}