import prisma from "@/lib/db/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { persistRouteGeometry } from "@/lib/db/queries/shipment";

export async function fetchAndPersistRouteGeometry(envioId: string): Promise<void> {
  const envio = await prisma.envio.findUnique({
    where: { id: envioId },
    select: {
      pickup_lat: true,
      pickup_lng: true,
      delivery_lat: true,
      delivery_lng: true,
    },
  });

  if (!envio?.pickup_lat || !envio?.delivery_lat) return;

  const { getRoute } = await import("@/lib/services/map-services");
  const route = await getRoute(
    [envio.pickup_lng!, envio.pickup_lat!],
    [envio.delivery_lng!, envio.delivery_lat!]
  );

  await persistRouteGeometry(envioId, route.geometry as Prisma.InputJsonValue);
}
