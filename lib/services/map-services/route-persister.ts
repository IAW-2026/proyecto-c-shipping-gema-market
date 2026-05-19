import { getEnvioCoords, persistRouteGeometry } from "@/lib/db/queries/shipment";
import { Prisma } from "@/lib/generated/prisma/client";
import { getRoute } from "@/lib/services/map-services";

export async function fetchAndPersistRouteGeometry(envioId: string): Promise<void> {
  const envio = await getEnvioCoords(envioId);
  if (!envio?.pickup_lat || !envio?.delivery_lat) return;

  const route = await getRoute(
    [envio.pickup_lng!, envio.pickup_lat!],
    [envio.delivery_lng!, envio.delivery_lat!]
  );

  await persistRouteGeometry(envioId, route.geometry as Prisma.InputJsonValue);
}
