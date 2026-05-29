import { getShipmentCoords } from "@/lib/db/queries/shared";
import { persistRouteGeometry } from "@/lib/db/mutations/shared";
import { Prisma } from "@/lib/generated/prisma/client";
import { getRoute } from "@/lib/clients/maps";

export async function fetchAndPersistRouteGeometry(shipmentId: string): Promise<void> {
  const shipment = await getShipmentCoords(shipmentId);
  if (!shipment?.pickup_lat || !shipment?.delivery_lat) return;

  const route = await getRoute(
    [shipment.pickup_lng!, shipment.pickup_lat!],
    [shipment.delivery_lng!, shipment.delivery_lat!]
  );

  await persistRouteGeometry(shipmentId, route.geometry as Prisma.InputJsonValue);
}
